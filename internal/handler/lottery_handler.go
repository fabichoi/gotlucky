package handler

import (
	"gotlucky/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LotteryHandler struct {
	service *service.LotteryService
}

func NewLotteryHandler(s *service.LotteryService) *LotteryHandler {
	return &LotteryHandler{s}
}

func (h *LotteryHandler) ParticipateLottery(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong ID"})
		return
	}

	result, err := h.service.Play(uint(id))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
