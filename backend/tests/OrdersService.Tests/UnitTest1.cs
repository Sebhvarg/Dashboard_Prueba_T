using Microsoft.EntityFrameworkCore;
using OrdersService.Controllers;
using OrdersService.Data;
using OrdersService.Models;
using OrdersService.enums;

namespace OrdersService.Tests;

public class OrdersControllerTests
{
    private OrdersDbContext GetDatabaseContext()
    {
        var options = new DbContextOptionsBuilder<OrdersDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        var context = new OrdersDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    [Fact]
    public async Task GetStats_ReturnsCorrectCounts()
    {
    
        var context = GetDatabaseContext();
        
        context.Clients.Add(new Client { Id = 1, Name = "Cliente A", Status = StatusClient.Active });
        context.Clients.Add(new Client { Id = 2, Name = "Cliente B", Status = StatusClient.Inactive });
        
        context.Orders.Add(new Order { Id = 1, ClientId = 1, Status = StateOrder.Approved, TotalAmount = 100, OrderDate = DateTime.UtcNow });
        context.Orders.Add(new Order { Id = 2, ClientId = 1, Status = StateOrder.Pending, TotalAmount = 50, OrderDate = DateTime.UtcNow });
        context.Orders.Add(new Order { Id = 3, ClientId = 1, Status = StateOrder.Rejected, TotalAmount = 20, OrderDate = DateTime.UtcNow });
        
        await context.SaveChangesAsync();

        var controller = new OrdersController(context);

        // Act
        var result = await controller.GetStats();
        var actionResult = Assert.IsType<Microsoft.AspNetCore.Mvc.ActionResult<object>>(result);
        var value = actionResult.Value; // Este es un objeto anonimo
        // Assert
        // Usando reflection para acceder a las propiedades del tipo anonimo
        var totalOrders = (int)value.GetType().GetProperty("TotalOrders").GetValue(value, null);
        var completedOrders = (int)value.GetType().GetProperty("CompletedOrders").GetValue(value, null);
        var pendingOrders = (int)value.GetType().GetProperty("PendingOrders").GetValue(value, null);
        var totalRevenue = (decimal)value.GetType().GetProperty("TotalRevenue").GetValue(value, null);
        var activeClients = (int)value.GetType().GetProperty("ActiveClients").GetValue(value, null);

        Assert.Equal(3, totalOrders);
        Assert.Equal(1, completedOrders); // Aprobadas
        Assert.Equal(1, pendingOrders); // Pendientes
        Assert.Equal(100, totalRevenue); // Solo Aprobadas
        Assert.Equal(1, activeClients); // Solo Activos
    }

    [Fact]
    public async Task CreateOrder_AddsToDatabase()
    {
        
        var context = GetDatabaseContext();
        var controller = new OrdersController(context);
        var newOrder = new Order { ClientId = 1, Status = StateOrder.Pending, TotalAmount = 200, Description = "Test Order" };

        // Act
        var result = await controller.CreateOrder(newOrder);

        // Assert
        Assert.IsType<Microsoft.AspNetCore.Mvc.CreatedAtActionResult>(result.Result);
        Assert.Equal(1, context.Orders.Count());
        Assert.Equal("Pending", context.Orders.First().Status.ToString());
    }
}
