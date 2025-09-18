import type { Config } from '@measured/puck';
import HeadingBlock, {
  HeadingBlockProps,
} from './components/puck/HeadingBlock';
import SectionBlock, {
  SectionBlockProps,
} from './components/puck/SectionBlock';
import ColumnsBlock, { ColumnsBlockProps } from './components/puck/Columns';
import TextBlock, { TextBlockProps } from './components/puck/TextBlock';

type Props = {
  HeadingBlock: HeadingBlockProps;
  SectionBlock: SectionBlockProps;
  ColumnsBlock: ColumnsBlockProps;
  TextBlock: TextBlockProps;
};

export const config: Config<Props> = {
  components: {
    HeadingBlock,
    SectionBlock,
    ColumnsBlock,
    TextBlock,
  },
  categories: {
    typography: {
      components: ['HeadingBlock', 'TextBlock'],
    },
    formatting: {
      components: ['ColumnsBlock'],
    },
  },
};

export default config;
