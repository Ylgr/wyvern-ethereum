
/*
  << Test Token (for use with the Test DAO) >>
*/

pragma solidity 0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./registry/ProxyRegistry.sol";

/**
  * @title TestToken
  * @author Project Wyvern Developers
  */
contract TestNft is ERC721Token {
    address proxyRegistryAddress;

    /**
      * @dev Initialize the test token
      */
    constructor (address _proxyRegistryAddress) public ERC721Token("Test NFT", "TSN") {
        proxyRegistryAddress = _proxyRegistryAddress;

        _mint(msg.sender, 20);
    }

    function isApprovedForAll(address owner, address operator)
    public
    view
    returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }
}
