/**
 * Leaves the first-run flow only once the new links are loaded; otherwise the client
 * layout still sees no salons and sends the user straight back to the welcome step.
 */
export async function finishOnboarding(
  refetchAccount: () => Promise<unknown>,
  navigate: () => void,
): Promise<void> {
  await refetchAccount();
  navigate();
}
