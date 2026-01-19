using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using OrdersService; // Namespace of Program.cs
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using OrdersService.Data;
using System.Linq;

using System.Net.Http.Json; 

namespace OrdersService.Tests;

// Prueba de integración
public class OrdersIntegrationTests : IClassFixture<WebApplicationFactory<Program>> 
{
    private readonly HttpClient _client;
    private readonly WebApplicationFactory<Program> _factory;

    public OrdersIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<OrdersDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<OrdersDbContext>(options =>
                {
                    options.UseInMemoryDatabase("OrdersTestDb");
                });
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetStats_ReturnsOkAndData()
    {
        var response = await _client.GetAsync("/api/v1/Orders/stats");

        response.EnsureSuccessStatusCode(); 
    }
}

