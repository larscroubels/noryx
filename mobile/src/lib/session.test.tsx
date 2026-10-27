import { act, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { reportAuthFailure } from "./auth-failure";
import { SessionProvider, useSession } from "./session";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({ router: { replace: (...a: unknown[]) => mockReplace(...a) } }));
jest.mock("./supabase", () => ({ supabase: {} }));

function fakeClient() {
  let listener: (event: string, session: unknown) => void = () => {};
  const client = {
    auth: {
      getSession: jest.fn(async () => ({ data: { session: { access_token: "a" } } })),
      getUser: jest.fn(async (): Promise<{ error: unknown }> => ({ error: null })),
      onAuthStateChange: jest.fn((cb: typeof listener) => {
        listener = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      signOut: jest.fn(async (_options?: { scope: string }): Promise<{ error: unknown }> => ({
        error: null,
      })),
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

function SignOutButton() {
  const { signOut } = useSession();
  return <Text onPress={() => void signOut()}>sign out</Text>;
}

async function renderWith(client: unknown) {
  await render(
    <SessionProvider client={client as never} endedMessage="Signed out">
      <Status />
      <SignOutButton />
    </SessionProvider>,
  );
  expect(await screen.findByText("signedIn")).toBeTruthy();
}

it("signs out when a request is rejected with 401", async () => {
  const { client } = fakeClient();
  client.auth.getUser.mockResolvedValueOnce({ error: { status: 401 } });
  await renderWith(client);
  await act(async () => reportAuthFailure());
  expect(client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
});

it("keeps the session when the server still accepts it", async () => {
  const { client } = fakeClient();
  await renderWith(client);
  await act(async () => reportAuthFailure());
  expect(client.auth.signOut).not.toHaveBeenCalled();
});

it("falls back to a local sign-out when offline", async () => {
  const { client } = fakeClient();
  client.auth.signOut.mockResolvedValueOnce({ error: { name: "AuthRetryableFetchError" } });
  await renderWith(client);
  await act(async () => {
    screen.getByText("sign out").props.onPress();
  });
  expect(client.auth.signOut).toHaveBeenLastCalledWith({ scope: "local" });
});
