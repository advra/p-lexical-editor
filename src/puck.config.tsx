import type { Config } from '@measured/puck';
import HeadingBlock, {
  HeadingBlockProps,
} from './components/puck/HeadingBlock';
import SectionBlock, {
  SectionBlockProps,
} from './components/puck/SectionBlock';
import ColumnsBlock, { ColumnsBlockProps } from './components/puck/Columns';
import TextBlock, { TextBlockProps } from './components/puck/TextBlock';
import ToggleBlock, { ToggleBlockProps } from './components/puck/ToggleBlock';
import rootPage from './components/puck/RootPage';

type Props = {
  ToggleBlock: ToggleBlockProps;
  HeadingBlock: HeadingBlockProps;
  SectionBlock: SectionBlockProps;
  ColumnsBlock: ColumnsBlockProps;
  TextBlock: TextBlockProps;
};

export const config: Config<Props> = {
  root: {
    render: ({ children }) => {
      return <div>{children}</div>;
    },
  },
  components: {
    ToggleBlock,
    HeadingBlock,
    SectionBlock,
    ColumnsBlock,
    TextBlock,
  },
  categories: {
    typography: {
      title: 'Typography',
      components: ['HeadingBlock', 'TextBlock'],
      defaultExpanded: true,
    },
    formatting: {
      defaultExpanded: true,
      title: 'Formatting',
      components: ['ColumnsBlock', 'ToggleBlock'],
    },
  },
};

export default config;
