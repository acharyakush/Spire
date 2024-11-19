"use client";

import dayjs from "dayjs";
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { Heading, Highlight, Input, Stack } from "@chakra-ui/react";
import { applicationName, isDevelopment, MyGlobal } from "@/utilities/global";

export default function Home() {
  // Business Logic
  const router = useRouter();
  const emailAddressReference = useRef(null);
  const passwordReference = useRef(null);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState({
    error: "",
    isLoading: false,
  });

  const autofill = () => {
    if (isDevelopment) {
      setEmailAddress("kush@admins.spire.com");
      setPassword("acharyakush2604");
    }
  };

  const authenticate = async (source) => {
    const _emailAddress =
      source === "click"
        ? emailAddress
        : emailAddressReference.current?.value || "";

    const _password =
      source === "click" ? password : passwordReference.current?.value || "";

    const emailAddressValidation = MyGlobal.validateEmailAddress(_emailAddress);

    if (!_emailAddress) {
      setData((prev) => ({
        ...prev,
        error: "Please enter your Spire account's email address.",
      }));
    } else if (emailAddressValidation.hasError) {
      setData((prev) => ({ ...prev, error: emailAddressValidation.text }));
    } else if (!_password) {
      setData((prev) => ({
        ...prev,
        error: "Please enter your Spire account's password.",
      }));
    } else {
      setData((s) => ({ ...s, error: "", isLoading: true }));

      const currentTimestamp = dayjs().format("hh:mm:ss a DD-MM-YYYY");

      const sessionToken = MyGlobal.obfuscate(
        `${currentTimestamp}${emailAddress}${password}`,
      );

      const jsonBody = JSON.stringify({ emailAddress, password });
      const body = { credentials: MyGlobal.obfuscate(jsonBody) };

      try {
        const response = await axios.post(
          MyConstants.apiEndpoints.authenticate,
          body,
        );

        if (response.status === 200) {
          MyGlobal.Storages.local.set(
            `${applicationName}_user_details`,
            response.data,
          );

          MyGlobal.Storages.session.set(
            `${applicationName}_token`,
            sessionToken,
          );

          MyGlobal.addActivity({
            activity: "Logged in.",
            session_id: sessionToken,
            user_id: "abc",
          });

          router.replace("/home");
        }
      } catch (error) {
        console.error("Authentication failed:", error);
      } finally {
        setData((s) => ({ ...s, error: "", isLoading: false }));
      }
    }
  };

  const detectKeystrokes = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      authenticate("key");
    }
  };

  const signInLabel = data.isLoading ? "Signing In ..." : "Sign In";

  useEffect(() => {
    globalThis.addEventListener("keydown", detectKeystrokes);
    return () => globalThis.removeEventListener("keydown", detectKeystrokes);
  }, []);

  return (
    <div className="flex w-screen min-h-screen p-4 justify-center items-center">
      <div className="w-1/4 p-4 space-y-10 shadow-sm">
        <span
          className="flex w-full justify-center items-center"
          onClick={autofill}
        >
          <Stack>
            <Heading size="4xl" letterSpacing="tight">
              <Highlight
                query="Spire"
                styles={{ color: "blue.700", fontWeight: "semibold" }}
              >
                Welcome to Spire
              </Highlight>
            </Heading>
          </Stack>
        </span>

        <div className="w-full">
          <Field
            invalid={data.error.length > 0}
            label="Email Address"
            errorText={data.error}
          >
            <Input
              onChange={(e) => setEmailAddress(e.target.value)}
              ref={emailAddressReference}
              size="md"
              tabIndex={1}
              value={emailAddress}
              variant="subtle"
            />
          </Field>
        </div>

        <div className="w-full">
          <Field label="Password">
            <PasswordInput
              onChange={(e) => setPassword(e.target.value)}
              ref={passwordReference}
              tabIndex={2}
              value={password}
              variant="subtle"
            />
          </Field>
        </div>

        <div className="flex w-full justify-center items-center">
          <Button
            colorPalette="blue"
            disabled={data.error.length > 0}
            loading={data.isLoading}
            onClick={() => authenticate("click")}
            tabIndex={3}
            variant="solid"
          >
            {signInLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
