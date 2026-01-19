using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using AuthService.Controllers;
using AuthService.Data;
using AuthService.Models;
using AuthService.DTOs;
using AuthService.Enums;
using System.Threading.Tasks;

namespace AuthService.Tests;

// Prueba de integración
public class AuthControllerTests
{
    private readonly Mock<IConfiguration> _mockConfig;
    private readonly AppDbContext _context;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        // Setup InMemory Database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "AuthTestDb")
            .Options;
        _context = new AppDbContext(options);

        // Mock Configuration
        _mockConfig = new Mock<IConfiguration>();
        _mockConfig.Setup(c => c.GetSection("JwtSettings:Key").Value).Returns("SuperSecretKeyForTestingPurposesOnly123!");
        _mockConfig.Setup(c => c.GetSection("JwtSettings:Issuer").Value).Returns("TestIssuer");
        _mockConfig.Setup(c => c.GetSection("JwtSettings:Audience").Value).Returns("TestAudience");

        _controller = new AuthController(_context, _mockConfig.Object);
    }

    [Fact]
    public async Task Register_ReturnsOk_WhenUserIsValid()
    {
        var request = new UserRegisterDto 
        { 
            Username = "testuser", 
            Password = "password123",
            Role = UserRole.Customer
        };

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Equal("Usuario registrado exitosamente.", okResult.Value);
    }
}
