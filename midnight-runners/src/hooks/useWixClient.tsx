"use client";
import { WixClientContext } from "../context/wixContext";
import { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

// Custom hook to get the Wix client
export const useWixClient = () => {
  const wixClient = useContext(WixClientContext);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    if (wixClient) {
      console.log("Wix client is initialized:", wixClient);
      setClientReady(true);
    } else {
      console.warn("Wix client is not yet initialized.");
    }
  }, [wixClient]);

  return { wixClient: clientReady ? wixClient : null, clientReady };
};
