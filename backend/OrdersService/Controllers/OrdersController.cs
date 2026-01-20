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
    public async Task<ActionResult<object>> GetStats([FromQuery] string period = "7days")
    {
        var totalOrders = await _context.Orders.CountAsync();
        var completedOrders = await _context.Orders.CountAsync(o => o.Status == StateOrder.Approved);
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == StateOrder.Pending);
        var rejectedOrders = await _context.Orders.CountAsync(o => o.Status == StateOrder.Rejected);
        var activeClients = await _context.Clients.CountAsync(c => c.Status == StatusClient.Active);

        // Ingresos totales (solo de órdenes aprobadas)
        var totalRevenue = await _context.Orders
            .Where(o => o.Status == StateOrder.Approved)
            .SumAsync(o => o.TotalAmount);

        // Actividad
        DateTime startDate;
        bool groupByWeek = false;

        switch (period.ToLower())
        {
            case "3months":
                startDate = DateTime.UtcNow.AddMonths(-3);
                groupByWeek = true;
                break;
            case "7days":
            default:
                startDate = DateTime.UtcNow.AddDays(-7);
                groupByWeek = false;
                break;
        }

        // Obtener fechas en memoria para agrupar (simplifica agrupación por semana/mes)
        var ordersInRange = await _context.Orders
            .Where(o => o.OrderDate >= startDate)
            .Select(o => o.OrderDate)
            .ToListAsync();

        object ordersByDate;

        if (groupByWeek)
        {
            ordersByDate = ordersInRange
                .GroupBy(d => System.Globalization.ISOWeek.GetYear(d) + "-" + System.Globalization.ISOWeek.GetWeekOfYear(d))
                .Select(g => new { 
                    Date = g.Min().Date, 
                    Count = g.Count() 
                })
                .OrderBy(x => x.Date)
                .ToList();
        }
        else
        {
            ordersByDate = ordersInRange
                .GroupBy(d => d.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .OrderBy(x => x.Date)
                .ToList();
        }

        return new
        {
            TotalOrders = totalOrders,
            CompletedOrders = completedOrders,
            PendingOrders = pendingOrders,
            RejectedOrders = rejectedOrders,
            ActiveClients = activeClients,
            TotalRevenue = totalRevenue,
            OrdersByDate = ordersByDate
        };
    }
}
