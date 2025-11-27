using Application.CQRS.Racks.Commands.Request;
using Application.CQRS.Racks.Handlers.CommandHandler;
using Application.CQRS.Racks.Handlers.QueryHandler;
using Application.CQRS.Racks.Queries.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WareHouseManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RacksController : ControllerBase
{
    private readonly AddRackCommandHandler _addHandler;
    private readonly UpdateRackCommandHandler _updateHandler;
    private readonly DeleteRackCommandHandler _deleteHandler;
    private readonly GetRacksByBlueprintQueryHandler _getByBlueprintHandler;
    private readonly GetRackByIdQueryHandler _getByIdHandler; 

    public RacksController(
        AddRackCommandHandler addHandler,
        UpdateRackCommandHandler updateHandler,
        DeleteRackCommandHandler deleteHandler,
        GetRacksByBlueprintQueryHandler getByBlueprintHandler,
        GetRackByIdQueryHandler getByIdHandler) 
    {
        _addHandler = addHandler;
        _updateHandler = updateHandler;
        _deleteHandler = deleteHandler;
        _getByBlueprintHandler = getByBlueprintHandler;
        _getByIdHandler = getByIdHandler; 
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Create([FromBody] AddRackCommandRequest request)
    {
        var response = await _addHandler.Handle(request, CancellationToken.None);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response); // ✅ Updated
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var request = new GetRackByIdQueryRequest { Id = id };
        var response = await _getByIdHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpGet("blueprint/{blueprintId:guid}")]
    [Authorize]
    public async Task<IActionResult> GetByBlueprint(Guid blueprintId)
    {
        var request = new GetRacksByBlueprintQueryRequest { BlueprintId = blueprintId };
        var response = await _getByBlueprintHandler.Handle(request, CancellationToken.None);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRackCommandRequest request)
    {
        if (id != request.Id)
            return BadRequest(new { message = "ID mismatch between route and body" });

        await _updateHandler.Handle(request, CancellationToken.None);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var request = new DeleteRackCommandRequest { Id = id };
        var result = await _deleteHandler.Handle(request, CancellationToken.None);
        return Ok(result);
    }
}