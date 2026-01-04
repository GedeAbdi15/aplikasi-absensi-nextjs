"use client";

import {
  EditOutlined,
  EllipsisOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Divider, Input, Space, Table } from "antd";
import { useRef, useState } from "react";
import Highlighter from "react-highlight-words";

const actions = [
  <EditOutlined key="edit" />,
  <SettingOutlined key="setting" />,
  <EllipsisOutlined key="ellipsis" />,
];

const dataTable = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
  },
  {
    key: "2",
    name: "Joe Black",
    attTime: "10:00:00",
    status: "IN",
  },
  {
    key: "3",
    name: "Jim Green",
    attTime: "10:00:00",
    status: "IN",
  },
  {
    key: "4",
    name: "Jim Red",
    attTime: "10:00:00",
    status: "IN",
  },
];

const DashboardPage = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: "10%",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "40%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Attendance Time",
      dataIndex: "attTime",
      key: "attTime",
      ...getColumnSearchProps("attTime"),
      sorter: (a, b) => a.address.length - b.address.length,
      width: "30%",
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      ...getColumnSearchProps("status"),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <Card actions={actions} className="w-full">
          <Card.Meta
            avatar={
              <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
            }
            title="Card title"
            description={
              <>
                <p>This is the description</p>
                <p>This is the description</p>
              </>
            }
          />
        </Card>
        <Card actions={actions} className="w-full">
          <Card.Meta
            avatar={
              <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
            }
            title="Card title"
            description={
              <>
                <p>This is the description</p>
                <p>This is the description</p>
              </>
            }
          />
        </Card>
        <Card actions={actions} className="w-full">
          <Card.Meta
            avatar={
              <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
            }
            title="Card title"
            description={
              <>
                <p>This is the description</p>
                <p>This is the description</p>
              </>
            }
          />
        </Card>
        <Card actions={actions} className="w-full">
          <Card.Meta
            avatar={
              <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
            }
            title="Card title"
            description={
              <>
                <p>This is the description</p>
                <p>This is the description</p>
              </>
            }
          />
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="">
          <Divider titlePlacement="left">Terlambat</Divider>
          <Table columns={columns} dataSource={dataTable} />
        </div>
        <div className="">
          <Divider titlePlacement="left">Karyawan</Divider>
          <Table columns={columns} dataSource={dataTable} />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
