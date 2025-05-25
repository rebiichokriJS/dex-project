// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DEXPair is ERC20 {
    IERC20 public token0;
    IERC20 public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;
    uint256 private constant FEE = 30; // 0.3% fee (30/10000)

    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out
    );
    event Sync(uint256 reserve0, uint256 reserve1);

    constructor(
        address _token0,
        address _token1
    ) ERC20("DEX LP Token", "DEX-LP") {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function addLiquidity(
        uint256 amount0,
        uint256 amount1,
        address to
    ) external returns (uint256 liquidity) {
        require(
            token0.transferFrom(msg.sender, address(this), amount0),
            "Transfer failed"
        );
        require(
            token1.transferFrom(msg.sender, address(this), amount1),
            "Transfer failed"
        );

        uint256 _reserve0 = reserve0;
        uint256 _reserve1 = reserve1;

        if (_reserve0 == 0 && _reserve1 == 0) {
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY); // Burn minimum liquidity
        } else {
            liquidity = min(
                (amount0 * totalSupply()) / _reserve0,
                (amount1 * totalSupply()) / _reserve1
            );
        }

        require(liquidity > 0, "Insufficient liquidity minted");
        _mint(to, liquidity);

        reserve0 = _reserve0 + amount0;
        reserve1 = _reserve1 + amount1;
        emit Sync(reserve0, reserve1);
    }

    function swap(uint256 amount0Out, uint256 amount1Out, address to) external {
        require(amount0Out > 0 || amount1Out > 0, "Invalid output amount");
        require(
            amount0Out < reserve0 && amount1Out < reserve1,
            "Insufficient liquidity"
        );

        uint256 amount0In = token0.balanceOf(address(this)) -
            (reserve0 - amount0Out);
        uint256 amount1In = token1.balanceOf(address(this)) -
            (reserve1 - amount1Out);

        // Calculate fees
        uint256 fee0 = (amount0In * FEE) / 10000;
        uint256 fee1 = (amount1In * FEE) / 10000;
        amount0In = amount0In - fee0;
        amount1In = amount1In - fee1;

        // Ensure constant product formula
        uint256 kBefore = reserve0 * reserve1;
        reserve0 = (reserve0 - amount0Out) + amount0In;
        reserve1 = (reserve1 - amount1Out) + amount1In;
        require(reserve0 * reserve1 >= kBefore, "Invalid K");

        // Transfer tokens
        if (amount0Out > 0) token0.transfer(to, amount0Out);
        if (amount1Out > 0) token1.transfer(to, amount1Out);

        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out);
        emit Sync(reserve0, reserve1);
    }

    function removeLiquidity(
        uint256 liquidity
    ) external returns (uint256 amount0, uint256 amount1) {
        require(liquidity > 0, "Invalid liquidity");
        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));

        amount0 = (liquidity * balance0) / totalSupply();
        amount1 = (liquidity * balance1) / totalSupply();

        require(amount0 > 0 && amount1 > 0, "Insufficient amounts");
        _burn(msg.sender, liquidity);

        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);

        reserve0 = balance0 - amount0;
        reserve1 = balance1 - amount1;
        emit Sync(reserve0, reserve1);
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
