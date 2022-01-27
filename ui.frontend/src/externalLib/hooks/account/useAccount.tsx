import { useAccountContext } from "../../contextProviders";

export const useAccount = () => {
  const { account } = useAccountContext();

  return {
    account
  };
};

