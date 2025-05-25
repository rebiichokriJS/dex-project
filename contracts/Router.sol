// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DEXPair.sol";
import "./Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Router {
    address public factory;

    constructor(address _factory) {
        factory = _factory;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        address to
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        address pair = Factory(factory).getPair(tokenA, tokenB);
        if (pair == address(0)) {
            pair = Factory(factory).createPair(tokenA, tokenB);
        }

        (amountA, amountB) = (amountADesired, amountBDesired);
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);
        liquidity = DEXPair(pair).addLiquidity(amountA, amountB, to);
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to
    ) external returns (uint256[] memory amounts) {
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        for (uint256 i = 0; i < path.length - 1; i++) {
            address pair = Factory(factory).getPair(path[i], path[i + 1]);
            require(pair != address(0), "Pair does not exist");

            // Logique de swap simplifiée (ajoutez un calcul de prix en production)
            uint256 amountOut = amounts[i]; // Placeholder
            IERC20(path[i]).transferFrom(msg.sender, pair, amounts[i]);
            DEXPair(pair).swap(0, amountOut, to);
            amounts[i + 1] = amountOut;
        }

        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "Insufficient output"
        );
    }
}
