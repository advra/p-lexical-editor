import { DropZone, type Config } from '@measured/puck';
import HeadingBlock, {
  HeadingBlockProps,
} from './components/puck/HeadingBlock';
import SectionBlock, {
  SectionBlockProps,
} from './components/puck/SectionBlock';
import SlotBlock, { SlotBlockProps } from './components/puck/SlotBlock';
import TextBlock, { TextBlockProps } from './components/puck/TextBlock';
import classNames from 'classnames';
import { PADDING_OPTIONS } from './components/puck/constants/padding';

type Props = {
  HeadingBlock: HeadingBlockProps;
  SectionBlock: SectionBlockProps;
  TextBlock: TextBlockProps;
  SlotBlock: SlotBlockProps;
};

export const config: Config<Props> = {
  root: {
    fields: {
      title: { type: 'text' }, // You need to redefine the `title` field if we want to retain it
      description: {
        label: 'Description: (Not displayed)',
        type: 'textarea',
      },
      tags: { type: 'text' },
      padding: {
        type: 'select',
        label: 'Page Padding',
        options: PADDING_OPTIONS,
      },
    },
    defaultProps: {
      padding: 12,
    },
    render: ({ children, title, description, projectTag: tags, padding }) => {
      return (
        <>
          <div className="pl-5 pt-2 text-gray-500">Tags: {tags || 'N/A'}</div>
          <div className={classNames(padding)}>
            <div className="text-center">
              <span className="text-4xl font-semibold">{title}</span>
              <div className="mt-3 h-[1px] bg-black" />
            </div>
            {children}
          </div>
        </>
      );
    },
  },
  components: {
    SlotBlock,
    HeadingBlock,
    SectionBlock,
    TextBlock,
  },
  categories: {
    typography: {
      title: 'Typography',
      components: ['HeadingBlock', 'SectionBlock', 'TextBlock'],
      defaultExpanded: true,
    },
    formatting: {
      defaultExpanded: true,
      title: 'Formatting',
      components: ['SlotBlock'],
    },
  },
};

export default config;
