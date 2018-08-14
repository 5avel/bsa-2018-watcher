﻿namespace Watcher
{
    using System;
    using System.IO;

    using Microsoft.AspNetCore;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;
    using Microsoft.WindowsAzure.Storage;

    using Serilog;
    using Serilog.Events;

    public class Program
    {
        public static IConfiguration Configuration { get; private set; }

        public static int Main(string[] args)
        {
            var configurationBuilder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
                .AddEnvironmentVariables();
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == EnvironmentName.Development)
            {
                configurationBuilder.AddUserSecrets<Program>(false);
            }

            Configuration = configurationBuilder.Build();
            var outputTemplate = "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{properties}{NewLine}";

            var connectionString = Configuration.GetConnectionString("LogsConnection");
            var storageAccount = CloudStorageAccount.Parse(connectionString);

            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(Configuration)
                .Enrich.FromLogContext()
                .WriteTo.Console(outputTemplate: outputTemplate)
                //.WriteTo.File(
                //    $@"D:\home\LogFiles\Application\bsa-api-SeriLogs-{DateTime.UtcNow:yyyy-dd-M}.txt", // Standart path for Azure Logs
                //    fileSizeLimitBytes: 1_000_000,
                //    rollOnFileSizeLimit: true,
                //    shared: true,
                //    flushToDiskInterval: TimeSpan.FromSeconds(1))
                .WriteTo.AzureTableStorage(storageAccount, LogEventLevel.Debug, storageTableName: "logs-table")
                .CreateLogger();

            try
            {
                Log.Information("Starting BSA Watcher Web App...");

                var host = CreateWebHostBuilder(args).Build();
                host.Run();

                return 0;
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Host terminated unexpectedly");
                return 1;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseSetting("detailedErrors", "true")
                .UseConfiguration(Configuration)
                .UseIISIntegration()
                .UseStartup<Startup>()
                .UseSerilog()
                .CaptureStartupErrors(true);
    }
}
