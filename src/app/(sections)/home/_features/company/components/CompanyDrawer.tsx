"use client";
import { Button, Drawer, Tooltip } from "antd";
import CompanyForm from "./CompanyForm";
import { useState } from "react";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useAuthContext } from "@/app/hooks/useAuthContext";
import { logOut } from "@/app/(sections)/auth/_features/action";

export default function CompanyDrawer() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { value } = useAuthContext();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onLogout = async () => {
    setIsLoading(true);

    sessionStorage.removeItem("authUser");

    await logOut();
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={showDrawer}
        icon={<SettingOutlined />}
      ></Button>

      <Drawer
        title={
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium">Datos de la Empresa</p>
              <p className="text-sm text-gray-400 font-normal">
                Configura los datos de tu empresa
              </p>
            </div>
            <Tooltip title="Cerrar sesión">
              <Button
                variant="outlined"
                color="primary"
                onClick={onLogout}
                loading={isLoading}
                icon={<LogoutOutlined />}
              />
            </Tooltip>
          </div>
        }
        closable={{ "aria-label": "Close Button" }}
        onClose={onClose}
        open={open}
        width={500}
      >
        <CompanyForm onCloseDrawer={onClose} companyId={value.companyId} />
      </Drawer>
    </>
  );
}
