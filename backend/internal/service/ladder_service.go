package service

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"math/big"
	"strconv"
	"strings"
	"time"

	"gotlucky/internal/model"
	"gotlucky/internal/repository"

	"gorm.io/gorm"
)

type LadderService struct {
	Repo *repository.LadderRepository
}

func NewLadderService(repo *repository.LadderRepository) *LadderService {
	return &LadderService{Repo: repo}
}

type LadderData struct {
	Columns   int            `json:"columns"`
	Rows      int            `json:"rows"`
	Rungs     [][]bool       `json:"rungs"`
	ResultMap map[string]int `json:"result_map"`
}

func (s *LadderService) CreateGame(hostID uint, resultLabels []string) (*model.LadderGame, error) {
	if len(resultLabels) == 0 {
		return nil, errors.New("결과 항목을 입력해주세요")
	}
	if len(resultLabels) < 2 || len(resultLabels) > 8 {
		return nil, errors.New("결과 항목은 2개 이상 8개 이하여야 합니다")
	}

	roomCode := s.generateRoomCode()

	game := &model.LadderGame{
		RoomCode:   roomCode,
		HostID:     hostID,
		Status:     "waiting",
		IsActive:   true,
		LadderData: "",
	}

	if err := s.Repo.Create(game); err != nil {
		return nil, err
	}

	// 호스트를 첫 번째 참여자로 추가
	host := &model.LadderParticipant{
		GameID:   game.ID,
		UserID:   hostID,
		Position: -1,
	}
	if err := s.Repo.AddParticipant(host); err != nil {
		return nil, err
	}

	// 결과 항목 생성 (position=-1)
	for _, label := range resultLabels {
		result := &model.LadderResult{
			GameID:   game.ID,
			Label:    label,
			Position: -1,
		}
		if err := s.Repo.CreateResult(result); err != nil {
			return nil, err
		}
	}

	return s.Repo.FindByIDPreloaded(game.ID)
}

func (s *LadderService) JoinRoom(userID uint, roomCode string) error {
	roomCode = strings.ToUpper(roomCode)

	game, err := s.Repo.FindByRoomCode(roomCode)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("방을 찾을 수 없습니다")
		}
		return err
	}

	// 이미 참여 중인지 체크
	if existing, err := s.Repo.FindParticipant(game.ID, userID); err == nil && existing != nil {
		return nil
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	if game.Status != "waiting" {
		return errors.New("게임이 이미 시작되었습니다")
	}

	// 결과 수 = 최대 참여자 수
	maxPlayers := len(game.Results)
	count, err := s.Repo.CountParticipants(game.ID)
	if err != nil {
		return err
	}
	if int(count) >= maxPlayers {
		return errors.New("방이 가득 찼습니다")
	}

	participant := &model.LadderParticipant{
		GameID:   game.ID,
		UserID:   userID,
		Position: -1,
	}
	return s.Repo.AddParticipant(participant)
}

func (s *LadderService) StartGame(gameID, requesterID uint) (*model.LadderGame, error) {
	game, err := s.Repo.FindByID(gameID)
	if err != nil {
		return nil, err
	}
	if game.HostID != requesterID {
		return nil, errors.New("방장만 게임을 시작할 수 있습니다")
	}

	participants, err := s.Repo.FindParticipants(gameID)
	if err != nil {
		return nil, err
	}
	results, err := s.Repo.FindResults(gameID)
	if err != nil {
		return nil, err
	}

	if len(participants) != len(results) {
		return nil, errors.New("참여자 수와 결과 수가 일치하지 않습니다")
	}

	columns := len(participants)

	// 참여자 위치 랜덤 배정
	participantPositions := shuffleRange(columns)
	for i := range participants {
		participants[i].Position = participantPositions[i]
	}

	// 결과 위치 랜덤 배정
	resultPositions := shuffleRange(columns)
	for i := range results {
		results[i].Position = resultPositions[i]
	}

	// 사다리 생성
	rungs, resultMap := generateLadder(columns)

	// 결과 매핑: resultMap[i] = j → position=i인 참여자가 position=j 결과에 도달
	// position 기준으로 참여자/결과 인덱싱
	participantByPosition := make(map[int]*model.LadderParticipant)
	for i := range participants {
		participantByPosition[participants[i].Position] = &participants[i]
	}
	resultByPosition := make(map[int]*model.LadderResult)
	for i := range results {
		resultByPosition[results[i].Position] = &results[i]
	}

	for startPos := 0; startPos < columns; startPos++ {
		endPos := resultMap[startPos]
		participant := participantByPosition[startPos]
		result := resultByPosition[endPos]
		if participant != nil && result != nil {
			uid := participant.UserID
			result.WinnerUserID = &uid
		}
	}

	// LadderData JSON 인코딩
	resultMapStr := make(map[string]int, len(resultMap))
	for k, v := range resultMap {
		resultMapStr[strconv.Itoa(k)] = v
	}
	rows := len(rungs)
	data := LadderData{
		Columns:   columns,
		Rows:      rows,
		Rungs:     rungs,
		ResultMap: resultMapStr,
	}
	encoded, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	now := time.Now()

	// 트랜잭션으로 한 번에 저장
	db := s.Repo.DB()
	if err := db.Transaction(func(tx *gorm.DB) error {
		for i := range participants {
			if err := tx.Save(&participants[i]).Error; err != nil {
				return err
			}
		}
		for i := range results {
			if err := tx.Save(&results[i]).Error; err != nil {
				return err
			}
		}
		game.LadderData = string(encoded)
		game.StartedAt = &now
		game.Status = "running"
		return tx.Save(game).Error
	}); err != nil {
		return nil, err
	}

	return s.Repo.FindByIDPreloaded(gameID)
}

func (s *LadderService) GetActiveGame(userID uint) (*model.LadderGame, error) {
	return s.Repo.FindActiveByUser(userID)
}

func (s *LadderService) ListRooms() ([]model.LadderGame, error) {
	return s.Repo.ListRooms()
}

func (s *LadderService) DeleteGame(gameID, requesterID uint) error {
	game, err := s.Repo.FindByID(gameID)
	if err != nil {
		return err
	}
	if game.HostID != requesterID {
		return errors.New("방장만 삭제할 수 있습니다")
	}
	return s.Repo.DeleteGame(gameID)
}

func (s *LadderService) generateRoomCode() string {
	const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // 혼동되는 O, 0, I, 1 제외
	code := make([]byte, 6)
	for i := range code {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		code[i] = charset[num.Int64()]
	}
	return string(code)
}

// generateLadder는 사다리의 가로줄 배치(rungs)와 결과 매핑(resultMap)을 생성한다.
// rungs[row][col] = col번 열과 col+1번 열 사이의 가로줄 존재 여부
func generateLadder(columns int) ([][]bool, map[int]int) {
	rows := columns * 3
	if rows < 8 {
		rows = 8
	}

	rungs := make([][]bool, rows)
	for r := 0; r < rows; r++ {
		row := make([]bool, columns-1)
		for c := 0; c < columns-1; c++ {
			// 같은 row에서 인접한 두 가로줄 금지
			if c > 0 && row[c-1] {
				row[c] = false
				continue
			}
			// 40% 확률로 가로줄 생성
			n, _ := rand.Int(rand.Reader, big.NewInt(100))
			if n.Int64() < 40 {
				row[c] = true
			}
		}
		rungs[r] = row
	}

	resultMap := make(map[int]int, columns)
	for col := 0; col < columns; col++ {
		pos := col
		for row := 0; row < rows; row++ {
			if pos > 0 && rungs[row][pos-1] {
				pos--
			} else if pos < columns-1 && rungs[row][pos] {
				pos++
			}
		}
		resultMap[col] = pos
	}

	return rungs, resultMap
}

// shuffleRange는 0..n-1을 crypto/rand로 셔플한 슬라이스를 반환한다.
func shuffleRange(n int) []int {
	arr := make([]int, n)
	for i := 0; i < n; i++ {
		arr[i] = i
	}
	// Fisher-Yates shuffle
	for i := n - 1; i > 0; i-- {
		j, _ := rand.Int(rand.Reader, big.NewInt(int64(i+1)))
		jj := int(j.Int64())
		arr[i], arr[jj] = arr[jj], arr[i]
	}
	return arr
}

