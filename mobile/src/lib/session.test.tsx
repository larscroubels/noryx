import { act, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { SessionProvider, useSession } from "./session";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({ router: { replace: (...a: unknown[]) => mockReplace(...a) } }));
jest.mock("./supabase", () => ({ supabase: {} }));

function fakeClient() {
  let listener: (event: string, session: unknown) => void = () => {};
  const client = {
    auth: {
      getSession: jest.fn(async () => ({ data: { session: { access_token: "a" } } })),
      onAuthStateChange: jest.fn((cb: typeof listener) => {
        listener = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      signOut: jest.fn(async () => ({ error: null })),
    },
  };
  return { client, emit: (event: string, session: unknown) => listener(event, session) };
}

function Status() {
  const { status, message } = useSession();
  return (
    <Text>
      {status}
      {message ? ` ${message}` : ""}
    </Text>
  );
}

it("signs out when the refresh token is rejected", async () => {
  const { client, emit } = fakeClient();
  await render(
    <SessionProvider client={client as never} onSignedOut={jest.fn()} endedMessage="Signed out">
      <Status />
    </SessionProvider>,
  );
  expect(await screen.findByText("signedIn")).toBeTruthy();
  await act(async () => emit("SIGNED_OUT", null));
  expect(screen.getByText("signedOut Signed out")).toBeTruthy();
  expect(mockReplace).toHaveBeenCalledWith("/sign-in");
});
