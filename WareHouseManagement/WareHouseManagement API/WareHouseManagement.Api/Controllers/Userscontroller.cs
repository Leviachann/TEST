using Application.CQRS.Users.Commands;
using Application.CQRS.Users.Commands.Request;
using Application.CQRS.Users.Handlers.CommandHandler;
using Application.CQRS.Users.Handlers.QueryHandler;
using Application.CQRS.Users.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly RegisterUserCommandHandler _registerHandler;
    private readonly GetAllUsersQueryHandler _getAllUsersHandler;
    private readonly GetUserByIdQueryHandler _getUserByIdHandler;
    private readonly GetMeQueryHandler _getMeHandler;
    private readonly UpdateUserCommandHandler _updateUserHandler;
    private readonly DeleteUserCommandHandler _deleteUserHandler;

    public UsersController(
        RegisterUserCommandHandler registerHandler,
        GetAllUsersQueryHandler getAllUsersHandler,
        GetUserByIdQueryHandler getUserByIdHandler,
        GetMeQueryHandler getMeHandler,
        UpdateUserCommandHandler updateUserHandler,
        DeleteUserCommandHandler deleteUserHandler)
    {
        _registerHandler = registerHandler;
        _getAllUsersHandler = getAllUsersHandler;
        _getUserByIdHandler = getUserByIdHandler;
        _getMeHandler = getMeHandler;
        _updateUserHandler = updateUserHandler;
        _deleteUserHandler = deleteUserHandler;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommandRequest request)
    {
        var response = await _registerHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var request = new GetAllUsersQueryRequest();
        var response = await _getAllUsersHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetUserByIdQueryRequest { Id = id };
        var response = await _getUserByIdHandler.Handle(request, CancellationToken.None);

        if (response == null)
            return NotFound(new { message = $"User with ID {id} not found" });

        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMe()
    {
        var request = new GetMeQueryRequest();
        var response = await _getMeHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserCommandRequest request)
    {
        if (id != request.Id)
        {
            return BadRequest(new { message = "ID mismatch between route and request body" });
        }

        var response = await _updateUserHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var request = new DeleteUserCommandRequest { Id = id };
        var response = await _deleteUserHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }
}