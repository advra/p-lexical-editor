import type { Config } from "@measured/puck";
import HeadingBlock from "./components/puck/HeadingBlock";

type Props = {
  HeadingBlock: { title: string };
};

export const config: Config<Props> = {
  components: {
    HeadingBlock,
  },
};

export default config;
