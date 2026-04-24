package handler

import (
	"gotlucky/internal/model"
	"gotlucky/internal/repository"
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type InviteHandler struct {
	Repo *repository.InviteRepository
}

func NewInviteHandler(r *repository.InviteRepository) *InviteHandler {
	return &InviteHandler{r}
}

func (h *InviteHandler) GenerateCode(c *gin.Context) {
	code := uuid.New().String()[:8] // Short UUID for convenience
	invite := &model.InviteCode{
		Code: code,
	}

	if err := h.Repo.CreateCode(invite); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate code"})
		return
	}

	c.JSON(http.StatusCreated, invite)
}

func (h *InviteHandler) ListCodes(c *gin.Context) {
	codes, err := h.Repo.GetAllCodes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list codes"})
		return
	}
	c.JSON(http.StatusOK, codes)
}
