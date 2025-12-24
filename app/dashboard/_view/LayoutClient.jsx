"use client";

import "../../globals.css";
import { Avatar, Button, Dropdown, Layout, Menu, Space, theme } from "antd";
import { getMe, logoutRequest } from "../../api/auth";
import Sider from "antd/es/layout/Sider";
import {
  AntDesignOutlined,
  AppstoreAddOutlined,
  AuditOutlined,
  ContainerOutlined,
  DashboardOutlined,
  DatabaseFilled,
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReconciliationOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Content, Header } from "antd/es/layout/layout";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const sidebarMenu = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
  },
  {
    key: "/users",
    icon: <ReconciliationOutlined />,
    label: <Link href="/users">Tambah User</Link>,
  },
  {
    key: "/applicants",
    icon: <AuditOutlined />,
    label: <Link href="/applicants">Manage Applicants</Link>,
  },
  {
    key: "manage-contents",
    icon: <DatabaseFilled />,
    label: "Manage Contents",
    children: [
      {
        key: "/banners",
        icon: <AppstoreAddOutlined />,
        label: <Link href="/banners">Banners</Link>,
      },
      {
        key: "/testimonials",
        icon: <ContainerOutlined />,
        label: <Link href="/testimonial">Testimonial</Link>,
      },
    ],
  },
];

const dropdownItems = [
  {
    key: "user_setting",
    label: "User Setting",
    disabled: true,
  },
  {
    type: "divider",
  },
  {
    key: "profile",
    label: "Profile",
    icon: <UserOutlined />,
  },
  {
    key: "setings",
    label: "Settings",
    icon: <SettingOutlined />,
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    label: "Logout",
    icon: <LogoutOutlined />,
  },
];

const objectStyles = {
  root: {
    backgroundColor: "#ffffff",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
  },
  item: {
    padding: "8px 12px",
    fontSize: "14px",
    width: "150px",
  },
  itemTitle: {
    fontWeight: "500",
  },
  itemIcon: {
    marginRight: "8px",
  },
  itemContent: {
    backgroundColor: "transparent",
  },
};

const MainLayoutClient = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathName = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();

  const handleLogout = async ({ key }) => {
    if (key === "logout") {
      try {
        await logoutRequest();
        router.replace("/login");
        router.refresh(); // penting
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  return (
    <Layout>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          scrollbarWidth: "thin",
          scrollbarGutter: "stable",
          paddingTop: "16px",
        }}
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={275}
      >
        <div className="grid grid-flow-col justify-items-center p-4">
          <Image
            src="/next.svg"
            alt="logo"
            className="dark:invert "
            width={100}
            height={20}
            priority
          />
        </div>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathName]}
          items={sidebarMenu.map((item) => ({ ...item, label: item.label }))}
          style={{
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "16px",
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </div>

          <div
            style={{
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar size="small" icon={<AntDesignOutlined />} />

            <Dropdown
              menu={{ items: dropdownItems, onClick: handleLogout }}
              placement="bottomRight"
              arrow
              styles={objectStyles}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  Menu
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            overflow: "initial",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayoutClient;
