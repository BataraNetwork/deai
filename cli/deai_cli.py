#!/usr/bin/env python
# -*- coding: utf-8 -*-
import typer
import asyncio
import time
from rich.console import Console
from rich.table import Table
from rich.live import Live
from rich.spinner import Spinner

# --- SDK Import ---
import sys
sys.path.append('.')
from sdk.deai_client import DeAIClient, APIException

# --- CLI Setup ---
app = typer.Typer(
    name="deai",
    help="A command-line interface for interacting with the DeAI Network.",
    add_completion=False,
)
console = Console()

# --- Client Initialization ---
client: DeAIClient = None

@app.callback()
def main(ctx: typer.Context):
    """
    Initialize the DeAI client, loading config from environment variables.
    """
    global client
    try:
        client = DeAIClient() 
        # No need to print success here, keep it clean
    except Exception as e:
        console.print(f"[bold red]Error:[/bold red] Could not initialize DeAI client. {e}")
        console.print("Please ensure your .env file is configured correctly.")
        raise typer.Exit(code=1)

# --- CLI Commands ---

@app.command()
def models():
    """
    Lists all available AI models on the network and their costs.
    """
    try:
        model_list = asyncio.run(client.get_models())
        table = Table(title="Available DeAI Models", show_header=True, header_style="bold magenta")
        table.add_column("Model ID", style="cyan")
        table.add_column("Cost per Job (USD)", style="yellow")

        for model in model_list:
            table.add_row(model['id'], f"${model['cost']:.4f}")

        console.print(table)
    except APIException as e:
        console.print(f"[bold red]API Error:[/bold red] {e}")
        raise typer.Exit(code=1)

@app.command()
def balance():
    """
    Checks your off-chain (fiat-backed) credit balance.
    """
    try:
        balance_data = asyncio.run(client.get_balance())
        balance_usd = balance_data['balance_usd']
        console.print(f"Your internal credit balance is: [bold green]${balance_usd:.4f} USD[/bold green]")
    except APIException as e:
        console.print(f"[bold red]API Error:[/bold red] {e}")
        raise typer.Exit(code=1)

@app.command()
def generate(
    prompt: str = typer.Argument(..., help="The prompt for the AI model."),
    model: str = typer.Option("gemma", "-m", "--model", help="The model ID to use for generation."),
    wait: bool = typer.Option(False, "-w", "--wait", help="Wait for the generation to complete and print the result.")
):
    """
    Submits a new generation job to the network.
    """
    try:
        console.print(f"&#128227; Submitting job for model [bold cyan]'{model}'[/bold cyan]...")
        task_info = asyncio.run(client.generate(prompt, model))
        console.print(f"[green]&#10003; Job submitted![/green] Task ID: [yellow]{task_info['task_id']}[/yellow]")

        if wait:
            status = ""
            with Live(Spinner("dots", text="Waiting for result..."), console=console, transient=True) as live:
                while status not in ["SUCCESS", "FAILURE"]:
                    time.sleep(2)
                    result = asyncio.run(client.get_result(task_info['task_id']))
                    status = result['status']
                    live.update(Spinner("dots", text=f"Task status: {status}"))

            console.print("--- Generation Result ---")
            if result['status'] == "SUCCESS":
                output = result['result']['output']
                console.print(output)
            else:
                console.print(f"[bold red]Generation Failed.[/bold red]")
                console.print(result.get('result', 'No details available.'))
        else:
            console.print(f"Run `deai result {task_info['task_id']}` to check the status.")

    except APIException as e:
        console.print(f"[bold red]API Error:[/bold red] {e.detail}")
        raise typer.Exit(code=1)

@app.command(name="result")
def get_result_command(task_id: str = typer.Argument(..., help="The ID of the task to check.")):
    """
    Gets the result of a previously submitted generation job.
    """
    try:
        with console.status("[bold yellow]Fetching result..."):
            result = asyncio.run(client.get_result(task_id))
        
        console.print(f"Task ID: [yellow]{result['task_id']}[/yellow]")
        console.print(f"Status: [bold green]{result['status']}[/bold green]")

        if result['result']:
            console.print("--- Result ---")
            console.print(result['result']['output'])

    except APIException as e:
        console.print(f"[bold red]API Error:[/bold red] {e}")
        raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
