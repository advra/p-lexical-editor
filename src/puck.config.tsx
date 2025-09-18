import type { Config } from '@measured/puck';
import HeadingBlock from './components/puck/HeadingBlock';
import SectionBlock from './components/puck/SectionBlock';

type Props = {
  HeadingBlock: { title: string };
  children: {};
};

export const config: Config<Props> = {
  components: {
    HeadingBlock,
    SectionBlock,
  },
};

export default config;
