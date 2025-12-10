using Application.CQRS.Auth.Handlers;
using Application.CQRS.Auth.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly LoginCommandHandler _loginHandler;
    private readonly RefreshTokenCommandHandler _refreshTokenHandler;
    private readonly LogoutCommandHandler _logoutHandler;

    public AuthController(
        LoginCommandHandler loginHandler,
        RefreshTokenCommandHandler refreshTokenHandler,
        LogoutCommandHandler logoutHandler)
    {
        _loginHandler = loginHandler;
        _refreshTokenHandler = refreshTokenHandler;
        _logoutHandler = logoutHandler;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _loginHandler.Handle(request, CancellationToken.None);

        if (response == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var response = await _refreshTokenHandler.Handle(request, CancellationToken.None);

        if (response == null)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var name = User.FindFirst("name")?.Value;

        return Ok(new
        {
            userId = userId,
            userName = userName,
            email = email,
            role = role,
            name = name
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
        {
            return BadRequest(new { message = "Invalid user ID" });
        }

        await _logoutHandler.Handle(userId, CancellationToken.None);

        return Ok(new
        {
            message = "Logged out successfully. All refresh tokens have been revoked."
        });
    }

    [HttpGet("test-auth")]
    [Authorize]
    public IActionResult TestAuth()
    {
        return Ok(new
        {
            message = "JWT Authentication is working!",
            user = User.Identity?.Name,
            role = User.FindFirst(ClaimTypes.Role)?.Value,
            claims = User.Claims.Select(c => new { c.Type, c.Value })
        });
    }

    [HttpGet("admin-only")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnly()
    {
        return Ok(new { message = "Admin access granted!" });
    }

    [HttpGet("moderator-or-admin")]
    [Authorize(Roles = "Admin,Moderator")]
    public IActionResult ModeratorOrAdmin()
    {
        return Ok(new { message = "Moderator or Admin access granted!" });
    }
}