// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * Contract module which acts as a timelocked controller.
 * When set as the owner of an Ownable smart contract, it
 * enforces a timelock on all onlyOwner maintenance operations.
 * This gives time for users of the controlled contract to exit
 * before a potentially dangerous maintenance operation is applied.
 * (https://docs.openzeppelin.com/contracts/4.x/api/governance#TimelockController)
 *
 * Actual owner of the proposal Box contract
 * Once a proposal passes, it won't go in effect right away,
 * we want to give the users time to get out of the DAO
 * if they don't like the new proposal before it takes effect
 */
contract TimeLock is TimelockController {
  // minDelay is how long you have to wait before executing
  // proposers is the list of addresses that can propose
  // executors is the list of addresses that can execute
  //`admin`: optional account to be granted admin role; disable with zero address  /**
  /**
   * IMPORTANT: The optional admin can aid with initial configuration of roles after deployment
   * without being subject to delay, but this role should be subsequently renounced in favor of
   * administration through timelocked proposals. Previous versions of this contract would assign
   * this admin to the deployer automatically and should be renounced as well.
   */
  constructor(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors,
    address admin
  ) TimelockController(minDelay, proposers, executors, admin) {}
}
