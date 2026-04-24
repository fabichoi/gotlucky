package dto

type RegisterInput struct {
	Name       string `json:"name" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	InviteCode string `json:"invite_code" binding:"required"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateUserInput struct {
	Name        string `json:"name,omitempty"`
	OldPassword string `json:"old_password,omitempty"`
	NewPassword string `json:"new_password,omitempty"`
}
