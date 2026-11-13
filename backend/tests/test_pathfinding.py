"""
Unit tests for ASTRA-X Part 7B: Rover Pathfinding and A* Grid Optimization.

Verifies:
1. A* finds the known optimal path on a hand-crafted grid.
2. Routes strictly avoid impassable cells (> max_slope_deg).
3. Unreachable goals return clear failure message.
4. Octile and Euclidean heuristics never overestimate true cost (admissibility).
"""

import math
import numpy as np
import pytest

from app.analysis.pathfinding import (
    run_astar,
    octile_heuristic,
    euclidean_heuristic,
)


def test_astar_finds_known_optimal_path():
    """
    Test 1: A* finds optimal straight diagonal path on a flat 5x5 grid.
    Start at (0, 0), goal at (4, 4). Optimal path length is 4 diagonal steps.
    """
    grid_size = 5
    dem = np.zeros((grid_size, grid_size), dtype=float)
    slope = np.zeros((grid_size, grid_size), dtype=float)
    cell_size = 100.0

    path, err = run_astar(
        dem=dem,
        slope_grid=slope,
        cell_size_m=cell_size,
        start=(0, 0),
        goal=(4, 4),
        max_slope_deg=25.0,
        mode="shortest"
    )

    assert err is None
    assert path is not None
    # Optimal direct diagonal path has 5 points (including start and goal)
    assert len(path) == 5
    assert path[0] == (0, 0)
    assert path[-1] == (4, 4)
    expected_path = [(0, 0), (1, 1), (2, 2), (3, 3), (4, 4)]
    assert path == expected_path


def test_astar_avoids_impassable_cells():
    """
    Test 2: A* routes around a wall of impassable steep slopes (> 25 deg).
    """
    # 5x5 grid with barrier in row 2 from col 0 to col 3:
    # Path must detour around column 4 to reach goal.
    dem = np.zeros((5, 5), dtype=float)
    slope = np.zeros((5, 5), dtype=float)
    # Impassable barrier
    slope[2, 0:4] = 30.0  # > 25 deg limit

    path, err = run_astar(
        dem=dem,
        slope_grid=slope,
        cell_size_m=10.0,
        start=(0, 0),
        goal=(4, 0),
        max_slope_deg=25.0,
        mode="shortest"
    )

    assert err is None
    assert path is not None
    assert path[0] == (0, 0)
    assert path[-1] == (4, 0)

    # Verify no cell in path touches the barrier (row 2, cols 0..3)
    for r, c in path:
        assert not (r == 2 and 0 <= c <= 3), f"Path violated obstacle at ({r}, {c})"

    # Verify detour went through col 4
    detour_cols = [c for r, c in path if r == 2]
    assert 4 in detour_cols


def test_astar_unreachable_goal_returns_clear_message():
    """
    Test 3: Unreachable goal completely surrounded by impassable cells returns error.
    """
    dem = np.zeros((5, 5), dtype=float)
    slope = np.zeros((5, 5), dtype=float)
    # Complete box enclosure around goal (4, 4)
    slope[3, 3:5] = 35.0
    slope[4, 3] = 35.0

    path, err = run_astar(
        dem=dem,
        slope_grid=slope,
        cell_size_m=10.0,
        start=(0, 0),
        goal=(4, 4),
        max_slope_deg=25.0
    )

    assert path is None
    assert err is not None
    assert "No traversable path exists" in err or "obstructed" in err


def test_heuristic_never_overestimates():
    """
    Test 4: Heuristic admissibility verification.
    The octile and euclidean heuristics must be <= true shortest path cost.
    """
    cell_size = 50.0
    # Test across multiple coordinate pairs
    pairs = [
        ((0, 0), (0, 4)),
        ((0, 0), (4, 4)),
        ((1, 2), (4, 1)),
        ((0, 3), (3, 0)),
    ]

    for (r1, c1), (r2, c2) in pairs:
        dr = abs(r1 - r2)
        dc = abs(c1 - c2)
        octile_h = octile_heuristic(r1, c1, r2, c2, cell_size)
        euclid_h = euclidean_heuristic(r1, c1, r2, c2, cell_size)

        # True shortest cost on an 8-connected grid with zero obstacles:
        true_min_cost = (max(dr, dc) - min(dr, dc) + math.sqrt(2.0) * min(dr, dc)) * cell_size

        assert octile_h <= true_min_cost + 1e-9
        assert euclid_h <= true_min_cost + 1e-9
