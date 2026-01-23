using Microsoft.EntityFrameworkCore;
using OrdersService.Data;
using OrdersService.Models;
using OrdersService.enums;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200") // Angular URL
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); 
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
    
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "OrdersService", Version = "v1" });
});

builder.Services.AddDbContext<OrdersDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Seed de datos: clientes y pedidos
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<OrdersDbContext>();
    
    // Aplicar migraciones pendientes automáticamente
    dbContext.Database.Migrate();
    
    // Crear clientes si no existen
    if (!dbContext.Clients.Any())
    {
        var clients = new List<Client>
        {
            new Client { Name = "Juan Perez", Email = "juan.perez@email.com", Phone = "0991234567", Status = StatusClient.Active },
            new Client { Name = "Maria Garcia", Email = "maria.garcia@email.com", Phone = "0987654321", Status = StatusClient.Active },
            new Client { Name = "Carlos Lopez", Email = "carlos.lopez@email.com", Phone = "0976543210", Status = StatusClient.Active },
            new Client { Name = "Ana Martinez", Email = "ana.martinez@email.com", Phone = "0965432109", Status = StatusClient.Active },
            new Client { Name = "Pedro Sanchez", Email = "pedro.sanchez@email.com", Phone = "0954321098", Status = StatusClient.Active },
            new Client { Name = "Laura Rodriguez", Email = "laura.rodriguez@email.com", Phone = "0943210987", Status = StatusClient.Active },
            new Client { Name = "Diego Hernandez", Email = "diego.hernandez@email.com", Phone = "0932109876", Status = StatusClient.Active },
            new Client { Name = "Sofia Gonzalez", Email = "sofia.gonzalez@email.com", Phone = "0921098765", Status = StatusClient.Active },
            new Client { Name = "Miguel Torres", Email = "miguel.torres@email.com", Phone = "0910987654", Status = StatusClient.Inactive },
            new Client { Name = "Lucia Ramirez", Email = "lucia.ramirez@email.com", Phone = "0909876543", Status = StatusClient.Active },
            new Client { Name = "Fernando Flores", Email = "fernando.flores@email.com", Phone = "0898765432", Status = StatusClient.Active },
            new Client { Name = "Valentina Diaz", Email = "valentina.diaz@email.com", Phone = "0887654321", Status = StatusClient.Active },
            new Client { Name = "Andres Morales", Email = "andres.morales@email.com", Phone = "0876543210", Status = StatusClient.Inactive },
            new Client { Name = "Camila Vargas", Email = "camila.vargas@email.com", Phone = "0865432109", Status = StatusClient.Active },
            new Client { Name = "Roberto Castro", Email = "roberto.castro@email.com", Phone = "0854321098", Status = StatusClient.Active }
        };
        
        dbContext.Clients.AddRange(clients);
        dbContext.SaveChanges();
        Console.WriteLine("15 clientes creados exitosamente.");
    }
    
    // Crear pedidos si no existen
    if (!dbContext.Orders.Any())
    {
        var random = new Random(42); // Seed fijo para reproducibilidad
        var orders = new List<Order>
        {
            new Order { ClientId = 1, TotalAmount = 150.50m, Status = StateOrder.Approved, Description = "Pedido de productos electronicos", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 2, TotalAmount = 89.99m, Status = StateOrder.Pending, Description = "Pedido de ropa de invierno", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 3, TotalAmount = 250.00m, Status = StateOrder.Approved, Description = "Pedido de muebles de oficina", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 1, TotalAmount = 75.25m, Status = StateOrder.Rejected, Description = "Pedido de accesorios", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 4, TotalAmount = 199.99m, Status = StateOrder.Approved, Description = "Pedido de electrodomesticos", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 5, TotalAmount = 45.00m, Status = StateOrder.Pending, Description = "Pedido de libros", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 6, TotalAmount = 320.75m, Status = StateOrder.Approved, Description = "Pedido de equipos deportivos", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 7, TotalAmount = 110.00m, Status = StateOrder.Pending, Description = "Pedido de herramientas", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 8, TotalAmount = 55.50m, Status = StateOrder.Approved, Description = "Pedido de cosmeticos", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 2, TotalAmount = 180.00m, Status = StateOrder.Approved, Description = "Pedido de juguetes", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 10, TotalAmount = 95.00m, Status = StateOrder.Rejected, Description = "Pedido de articulos de cocina", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 11, TotalAmount = 420.00m, Status = StateOrder.Approved, Description = "Pedido de tecnologia", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 12, TotalAmount = 67.80m, Status = StateOrder.Pending, Description = "Pedido de decoracion", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 14, TotalAmount = 299.99m, Status = StateOrder.Approved, Description = "Pedido de instrumentos musicales", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 15, TotalAmount = 135.00m, Status = StateOrder.Pending, Description = "Pedido de jardineria", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 3, TotalAmount = 88.50m, Status = StateOrder.Approved, Description = "Pedido de papeleria", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 5, TotalAmount = 210.00m, Status = StateOrder.Rejected, Description = "Pedido de camping", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 8, TotalAmount = 165.25m, Status = StateOrder.Approved, Description = "Pedido de mascotas", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 6, TotalAmount = 78.00m, Status = StateOrder.Pending, Description = "Pedido de limpieza", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)) },
            new Order { ClientId = 4, TotalAmount = 445.00m, Status = StateOrder.Approved, Description = "Pedido de computadoras", OrderDate = DateTime.UtcNow.AddDays(-random.Next(0, 90)), Cantidad = 2}
        };
        
        dbContext.Orders.AddRange(orders);
        dbContext.SaveChanges();
        Console.WriteLine("20 pedidos creados exitosamente.");
    }
}

// Configura la pipeline de HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularApp"); // Habilita CORS

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }


