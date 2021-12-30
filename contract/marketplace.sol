// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract CarPool {
    uint256 internal poolsLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Pool {
        address payable creator;
        uint256 numOfPassengers;
        uint256 initNumOfPassenger;
        address[] passengers;
        uint256 price;
    }

    struct Route {
        string origin;
        string destination;
        string time;
        string dates;
    }

    mapping(uint256 => Pool) internal pools;
    mapping(uint256 => Route) internal routes;

    function createPool(
        string memory _origin,
        string memory _destination,
        string memory _time,
        string memory _dates,
        uint256 _initNumOfPassenger,
        uint256 _price
    ) public {
        routes[poolsLength] = Route(_origin, _destination, _time, _dates);

        address[] memory _passengers;

        pools[poolsLength] = Pool(
            payable(msg.sender),
            _initNumOfPassenger,
            _initNumOfPassenger,
            _passengers,
            _price
        );

        pools[poolsLength].passengers.push(msg.sender);

        poolsLength++;
    }

    function getPool(uint256 _index)
        public
        view
        returns (
            address payable,
            uint256,
            uint256,
            address[] memory,
            uint256
        )
    {
        return (
            pools[_index].creator,
            pools[_index].numOfPassengers,
            pools[_index].initNumOfPassenger,
            pools[_index].passengers,
            pools[_index].price
        );
    }

    function getRoute(uint256 _index)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        return (
            routes[_index].origin,
            routes[_index].destination,
            routes[_index].time,
            routes[_index].dates
        );
    }

    function joinPool(uint256 _index) public payable {
        require(pools[_index].numOfPassengers > 0, "Pool Full");
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                pools[_index].creator,
                pools[_index].price
            ),
            "Transfer failed."
        );
        pools[_index].numOfPassengers--;
        pools[_index].passengers.push(msg.sender);
    }

    function getPoolsLength() public view returns (uint256) {
        return (poolsLength);
    }
}
