package handler

import (
	"net/http"
	"strconv"

	"gotlucky/internal/model"
	"gotlucky/internal/service"

	"github.com/gin-gonic/gin"
)

type GameTypeHandler struct {
	Service *service.GameTypeService
}

func NewGameTypeHandler(s *service.GameTypeService) *GameTypeHandler {
	return &GameTypeHandler{Service: s}
}

func (h *GameTypeHandler) CreateGameType(c *gin.Context) {
	var gt model.GameType
	if err := c.ShouldBindJSON(&gt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.CreateGameType(&gt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gt)
}

func (h *GameTypeHandler) ListGameTypes(c *gin.Context) {
	types, err := h.Service.GetAllGameTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, types)
}

func (h *GameTypeHandler) GetGameType(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	typeData, err := h.Service.GetGameTypeByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, typeData)
}
