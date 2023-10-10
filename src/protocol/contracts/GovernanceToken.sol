// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
  /** 1 Million tokens (18 dec)*/
  uint256 public s_maxSupply = 1000000000000000000000000;

  constructor() ERC20("TribalGovernanceToken", "TRBG") ERC20Permit("GovernanceToken") {
    _mint(msg.sender, s_maxSupply);
  }

  // The functions below are overrides required by Solidity.

  /**
   * Used to update the snapshot of the blockchain,
   * to keep track of the amount of tokens that every wallet has at each block,
   * and this way avoid users purchasing and then dumping tokens just to vote certain proposals.
   * Making sure voters keep the tokens because they actually support the DAO
   */
  function _afterTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC20Votes) {
    super._afterTokenTransfer(from, to, amount);
  }

  function _mint(address to, uint256 amount) internal override(ERC20Votes) {
    super._mint(to, amount);
  }

  function _burn(address account, uint256 amount) internal override(ERC20Votes) {
    super._burn(account, amount);
  }
}
