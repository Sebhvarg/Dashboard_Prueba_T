using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrdersService.Data;
using OrdersService.Models;
using OrdersService.enums;

namespace OrdersService.Controllers;

[Route("api/v1/[controller]")]

[ApiController]
public class OrdersController : ControllerBase
{
    private readonly OrdersDbContext _context;

    public OrdersController(OrdersDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        return await _context.Orders.Include(o => o.Client).ToListAsync();
    }
    
    // Filtrar por estado
    [HttpGet("filter/{status}")]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByStatus(StateOrder status)
    {
        return await _context.Orders
            .Include(o => o.Client)
            .Where(o => o.Status == status)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOrders), new { id = order.Id }, order);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(int id, Order order)
    {
        if (id != order.Id) return BadRequest();
        _context.Entry(order).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    // Estadísticas para el Dashboard
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var totalOrders = await _context.Orders.CountAsync();
        var completedOrders = await _context.Orders.CountAsync(o => o.Status == StateOrder.Approved);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == StateOrder.Pending);
        var activeClients = await _context.Clients.CountAsync();

        return new
        {
            TotalOrders = totalOrders,
            CompletedOrders = completedOrders,
            PendingOrders = pendingOrders,
            ActiveClients = activeClients
        };
    }
}
