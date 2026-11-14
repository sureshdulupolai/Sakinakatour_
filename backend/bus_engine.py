import json
from typing import List, Dict, Any
from models import SeatAllocation, Bus

def generate_seat_allocations_for_bus(bus: Bus) -> List[SeatAllocation]:
    """
    Generates exact SeatAllocation rows for a bus based on its layout configuration.
    Supports 4 configurable seat numbering patterns:
      1. continuous_rl: Numeric Right to Left (Col 4=1, Col 3=2, Col 2=3, Col 1=4...)
      2. continuous_lr: Numeric Left to Right (Col 1=1, Col 2=2, Col 3=3, Col 4=4...)
      3. row_alpha_lr:  Row + Letter Left to Right (1A, 1B, 1C, 1D...)
      4. row_alpha_rl:  Row + Letter Right to Left (1D, 1C, 1B, 1A...)
    Handles:
      - Left & Right seats per row (e.g. 2x2, 3x2, 2x1, 1x2)
      - Back row seats (optional: has_back_row toggle + back_row_seats count)
      - Upper deck sleeper / 2-tier berths
    """
    seats: List[SeatAllocation] = []
    
    pattern = getattr(bus, "numbering_pattern", "continuous_rl") or "continuous_rl"
    has_back = getattr(bus, "has_back_row", True)
    back_seats_count = bus.back_row_seats if has_back else 0
    
    L = bus.left_seats_per_row
    R = bus.right_seats_per_row
    W = L + R  # total columns across a normal row
    
    alphabet = ["A", "B", "C", "D", "E", "F", "G", "H"]

    def get_row_seat_number(deck: str, r: int, c: int) -> str:
        prefix = "U" if deck == "upper" else ""
        if pattern == "continuous_rl":
            # Right-to-Left: Col W is 1, Col W-1 is 2, ..., Col 1 is W
            rtl_pos = W - c + 1
            num = (r - 1) * W + rtl_pos
            return f"{prefix}{num}" if prefix else str(num)
            
        elif pattern == "continuous_lr":
            # Left-to-Right: Col 1 is 1, Col 2 is 2, ..., Col W is W
            num = (r - 1) * W + c
            return f"{prefix}{num}" if prefix else str(num)
            
        elif pattern == "row_alpha_rl":
            # Right-to-Left alpha: Col W gets A, Col W-1 gets B...
            letter_idx = min(W - c, len(alphabet) - 1)
            letter = alphabet[letter_idx]
            return f"{prefix}{r}{letter}"
            
        else:  # row_alpha_lr
            letter_idx = min(c - 1, len(alphabet) - 1)
            letter = alphabet[letter_idx]
            return f"{prefix}{r}{letter}"

    def get_back_seat_number(deck: str, i: int, total_back: int, regular_count: int) -> str:
        prefix = "U" if deck == "upper" else ""
        if pattern == "continuous_rl":
            rtl_pos = total_back - i + 1
            num = regular_count + rtl_pos
            return f"{prefix}{num}" if prefix else str(num)
        elif pattern == "continuous_lr":
            num = regular_count + i
            return f"{prefix}{num}" if prefix else str(num)
        else:
            return f"{prefix}B-{i}"

    # Lower Deck (or single deck)
    lower_reg_count = bus.total_rows * W
    for r in range(1, bus.total_rows + 1):
        # Left side
        for col_idx in range(1, L + 1):
            s_num = get_row_seat_number("lower", r, col_idx)
            seats.append(SeatAllocation(
                bus_id=bus.id,
                seat_number=s_num,
                deck="lower",
                row=r,
                col=col_idx,
                side="left",
                status="AVAILABLE"
            ))
        
        # Right side
        for col_idx in range(L + 1, W + 1):
            s_num = get_row_seat_number("lower", r, col_idx)
            seats.append(SeatAllocation(
                bus_id=bus.id,
                seat_number=s_num,
                deck="lower",
                row=r,
                col=col_idx,
                side="right",
                status="AVAILABLE"
            ))

    # Back row seats (lower deck rear)
    if has_back and back_seats_count > 0:
        back_row_num = bus.total_rows + 1
        for i in range(1, back_seats_count + 1):
            s_num = get_back_seat_number("lower", i, back_seats_count, lower_reg_count)
            seats.append(SeatAllocation(
                bus_id=bus.id,
                seat_number=s_num,
                deck="lower",
                row=back_row_num,
                col=i,
                side="back",
                status="AVAILABLE"
            ))

    # Upper Deck (sleeper / 2-tier)
    if bus.has_upper_deck:
        upper_reg_count = bus.total_rows * W
        for r in range(1, bus.total_rows + 1):
            # Left side upper
            for col_idx in range(1, L + 1):
                s_num = get_row_seat_number("upper", r, col_idx)
                seats.append(SeatAllocation(
                    bus_id=bus.id,
                    seat_number=s_num,
                    deck="upper",
                    row=r,
                    col=col_idx,
                    side="left",
                    status="AVAILABLE"
                ))
            
            # Right side upper
            for col_idx in range(L + 1, W + 1):
                s_num = get_row_seat_number("upper", r, col_idx)
                seats.append(SeatAllocation(
                    bus_id=bus.id,
                    seat_number=s_num,
                    deck="upper",
                    row=r,
                    col=col_idx,
                    side="right",
                    status="AVAILABLE"
                ))

        # Upper Deck Back Row
        if has_back and back_seats_count > 0:
            back_row_num = bus.total_rows + 1
            for i in range(1, back_seats_count + 1):
                s_num = get_back_seat_number("upper", i, back_seats_count, upper_reg_count)
                seats.append(SeatAllocation(
                    bus_id=bus.id,
                    seat_number=s_num,
                    deck="upper",
                    row=back_row_num,
                    col=i,
                    side="back",
                    status="AVAILABLE"
                ))

    return seats


def calculate_bus_total_seats(
    left_seats_per_row: int,
    right_seats_per_row: int,
    total_rows: int,
    has_back_row: bool = True,
    back_row_seats: int = 5,
    has_upper_deck: bool = False
) -> int:
    seats_per_row = left_seats_per_row + right_seats_per_row
    effective_back = back_row_seats if has_back_row else 0
    lower_total = (seats_per_row * total_rows) + effective_back
    upper_back = effective_back if (has_upper_deck and effective_back > 0) else 0
    upper_total = ((seats_per_row * total_rows) + upper_back) if has_upper_deck else 0
    return lower_total + upper_total
