using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        // Get the current directory
        string currentDirectory = Directory.GetCurrentDirectory();
        Console.WriteLine($"Current directory: {currentDirectory}");

        // Number of times to run the command
        const int numberOfRuns = 100;
        Console.WriteLine($"Starting {numberOfRuns} parallel npm run fill executions...");
        
        // Create a list of tasks to run in parallel
        var tasks = new List<Task>();
        for (int i = 0; i < numberOfRuns; i++)
        {
            tasks.Add(RunNpmCommand(currentDirectory, i + 1));
            // Add a small delay between starting processes to prevent overwhelming the system
            await Task.Delay(100);
        }

        // Wait for all tasks to complete
        await Task.WhenAll(tasks);
        
        Console.WriteLine("All npm commands completed!");
    }

    static async Task RunNpmCommand(string directory, int runNumber)
    {
        try
        {
            Console.WriteLine($"Starting npm run fill (Run #{runNumber})");
            
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/c npm run fill",
                    WorkingDirectory = directory,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };

            process.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    Console.WriteLine($"[Run #{runNumber}] {e.Data}");
                }
            };

            process.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    Console.WriteLine($"[Run #{runNumber}] ERROR: {e.Data}");
                }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                Console.WriteLine($"Process #{runNumber} exited with code {process.ExitCode}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error running npm command (Run #{runNumber}): {ex.Message}");
        }
    }
} 