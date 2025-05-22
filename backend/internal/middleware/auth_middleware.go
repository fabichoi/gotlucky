package middleware

import (
	"gotlucky/internal/model"
	"gotlucky/internal/util"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	whitelist := []string{
		"/v1/auth/register",
		"/v1/auth/login",
		"/health",
	}

	return func(c *gin.Context) {
		path := c.FullPath()

		for _, w := range whitelist {
			if strings.HasPrefix(path, w) {
				c.Next()
				return
			}
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization failed"})
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := util.ValidateJWT(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		var authToken model.AuthToken
		if err := db.Where("token = ? AND expires_at > ?", token, time.Now()).First(&authToken).Error; err != nil {
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)

		c.Next()
	}
}
