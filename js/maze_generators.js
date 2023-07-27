"use strict";

function get_neighbours(cell, distance)
{
	let up = [cell[0], cell[1] - distance];
	let right = [cell[0] + distance, cell[1]];
	let down = [cell[0], cell[1] + distance];
	let left = [cell[0] - distance, cell[1]];
	return [up, right, down, left];
}

function random_int(min, max)
{
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function fill()
{
	for (let i = 0; i < grid.length; i++)
		for (let j = 0; j < grid[0].length; j++)
			add_wall(i, j);
}

function fill_walls()
{
	for (let i = 0; i < grid.length; i++)
		for (let j = 0; j < grid[0].length; j++)
			if (i % 2 == 0 || j % 2 == 0)
				add_wall(i, j);
}

function enclose()
{
	for (let i = 0; i < grid.length; i++)
	{
		add_wall(i, 0);
		add_wall(i, grid[0].length - 1);
	}

	for (let j = 0; j < grid[0].length; j++)
	{
		add_wall(0, j);
		add_wall(grid.length - 1, j);
	}
}

function randomized_depth_first()
{
	fill();
	let current_cell = [1, 1];
	remove_wall(current_cell[0], current_cell[1]);
	grid[current_cell[0]][current_cell[1]] = 1;
	let stack = [current_cell];

	my_interval = window.setInterval(function()
	{
		if (stack.length == 0)
		{
			clearInterval(my_interval);
			clear_grid();
			generating = false;
			return;
		}

		current_cell = stack.pop();
		let neighbours = [];
		let list = get_neighbours(current_cell, 2);

		for (let i = 0; i < list.length; i++)
			if (get_node(list[i][0], list[i][1]) == -1 || get_node(list[i][0], list[i][1]) == 0)
				neighbours.push(list[i]);

		if (neighbours.length > 0)
		{
			stack.push(current_cell);
			let chosen_cell = neighbours[random_int(0, neighbours.length)];
			remove_wall((current_cell[0] + chosen_cell[0]) / 2, (current_cell[1] + chosen_cell[1]) / 2);
			remove_wall(chosen_cell[0], chosen_cell[1]);
			grid[chosen_cell[0]][chosen_cell[1]] = 1;
			stack.push(chosen_cell);
		}

		else
		{
			remove_wall(current_cell[0], current_cell[1]);
			grid[current_cell[0]][current_cell[1]] = 2;
			place_to_cell(current_cell[0], current_cell[1]).classList.add("visited_cell");

			for (let i = 0; i < list.length; i++)
			{
				let wall = [(current_cell[0] + list[i][0]) / 2, (current_cell[1] + list[i][1]) / 2]

				if (get_node(list[i][0], list[i][1]) == 2 && get_node(wall[0], wall[1]) > -1)
					place_to_cell(wall[0], wall[1]).classList.add("visited_cell");
			}
		}
	}, 16);
}

function recursive_division()
{
	enclose();
	let time = 0;
	let step = 17;
	timeouts = [];

	function sub_recursive_division(x_min, y_min, x_max, y_max)
	{
		if (y_max - y_min > x_max - x_min)
		{
			let x = random_int(x_min + 1, x_max);
			let y = random_int(y_min + 2, y_max - 1);

			if ((x - x_min) % 2 == 0)
				x += (random_int(0, 2) == 0 ? 1 : -1);

			if ((y - y_min) % 2 == 1)
				y += (random_int(0, 2) == 0 ? 1 : -1);

			for (let i = x_min + 1; i < x_max; i++)
				if (i != x)
				{
					time += step;
					timeouts.push(setTimeout(function() { add_wall(i, y); }, time));
				}

			if (y - y_min > 2)
				sub_recursive_division(x_min, y_min, x_max, y);

			if (y_max - y > 2)
				sub_recursive_division(x_min, y, x_max, y_max);
		}

		else
		{
			let x = random_int(x_min + 2, x_max - 1);
			let y = random_int(y_min + 1, y_max);

			if ((x - x_min) % 2 == 1)
				x += (random_int(0, 2) == 0 ? 1 : -1);

			if ((y - y_min) % 2 == 0)
				y += (random_int(0, 2) == 0 ? 1 : -1);

			for (let i = y_min + 1; i < y_max; i++)
				if (i != y)
				{
					time += step;
					timeouts.push(setTimeout(function() { add_wall(x, i); }, time));
				}

			if (x - x_min > 2)
				sub_recursive_division(x_min, y_min, x, y_max);

			if (x_max - x > 2)
				sub_recursive_division(x, y_min, x_max, y_max);
		}
	}

	sub_recursive_division(0, 0, grid.length - 1, grid[0].length - 1);
	timeouts.push(setTimeout(function() { generating = false; timeouts = [] }, time));
}

function maze_generators()
{
	let start_temp = start_pos;
	let target_temp = target_pos;
	hidden_clear();
	generating = true;

	if (start_temp[0] % 2 == 0)
	{
		if (start_temp[0] == grid.length - 1)
			start_temp[0] -= 1;
		else
			start_temp[0] += 1;
	}

	if (start_temp[1] % 2 == 0)
	{
		if (start_temp[1] == 0)
			start_temp[1] += 1;
		else
			start_temp[1] -= 1;
	}

	if (target_temp[0] % 2 == 0)
	{
		if (target_temp[0] == grid.length - 1)
			target_temp[0] -= 1;
		else
			target_temp[0] += 1;
	}

	if (target_temp[1] % 2 == 0)
	{
		if (target_temp[1] == 0)
			target_temp[1] += 1;
		else
			target_temp[1] -= 1;
	}

	place_to_cell(start_pos[0], start_pos[1]).classList.remove("start");
	place_to_cell(start_temp[0], start_temp[1]).classList.add("start");
	place_to_cell(target_pos[0], target_pos[1]).classList.remove("target");
	place_to_cell(target_temp[0], target_temp[1]).classList.add("target");
	start_pos = start_temp;
	target_pos = target_temp;

	grid_clean = false;

	if (document.querySelector("#slct_2").value == "1")
		randomized_depth_first();


	else if (document.querySelector("#slct_2").value == "6")
		recursive_division();
}
