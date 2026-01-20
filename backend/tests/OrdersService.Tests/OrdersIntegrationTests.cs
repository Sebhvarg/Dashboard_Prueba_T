using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using OrdersService; // Namespace of Program.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using OrdersService.Data;
using System.Linq;

using System.Net.Http.Json; 
using OrdersService.Models;
using OrdersService.enums; 

namespace OrdersService.Tests;

public class OrdersIntegrationTests : IClassFixture<WebApplicationFactory<Program>> 
{
   
}

// Clase auxiliar para deserializar estadísticas
public class StatsResponse
{
    public int TotalOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int PendingOrders { get; set; }
    public int RejectedOrders { get; set; }
    public int ActiveClients { get; set; }
    public decimal TotalRevenue { get; set; }
}

