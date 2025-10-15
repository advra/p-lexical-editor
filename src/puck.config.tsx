import { DropZone, type Config } from '@measured/puck';
import HeadingBlock, {
  HeadingBlockProps,
} from './components/puck/HeadingBlock';
import SectionBlock, {
  SectionBlockProps,
} from './components/puck/SectionBlock';
import ColumnsBlock, { ColumnsBlockProps } from './components/puck/Columns';
import TextBlock, { TextBlockProps } from './components/puck/TextBlock';
import ToggleBlock, { ToggleBlockProps } from './components/puck/ToggleBlock';
import { Avatar, Card, CardHeader } from '@mui/material';
import classNames from 'classnames';
import { PADDING_OPTIONS } from './components/puck/constants/padding';
import {
  ChecklistBlock,
  ChecklistBlockProps,
} from './components/puck/ChecklistBlock';
import { TaskItemBlock, TaskItemProps } from './components/puck/TaskItemBlock';

type Props = {
  ChecklistBlock: ChecklistBlockProps;
  ToggleBlock: ToggleBlockProps;
  HeadingBlock: HeadingBlockProps;
  SectionBlock: SectionBlockProps;
  ColumnsBlock: ColumnsBlockProps;
  TextBlock: TextBlockProps;
  TaskItemBlock: TaskItemProps;
  Grid: {};
  Card: {
    title: string;
    subtitle: string;
    description: string;
    padding: number;
  };
  FlexContainer: {};
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
    ChecklistBlock,
    ToggleBlock,
    HeadingBlock,
    SectionBlock,
    ColumnsBlock,
    TextBlock,
    TaskItemBlock,
    Grid: {
      label: 'Grid',
      fields: {
        columns: { type: 'number', label: 'Columns', placeholder: '3' },
        gap: { type: 'number', label: 'Gap (px)', placeholder: '16' },
        content: { type: 'slot', label: 'Grid content' },
      },
      defaultProps: {
        columns: 3,
        gap: 16,
      },
      render: ({ content: Content, columns = 3, gap = 16 }) => (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap,
          }}
        >
          <Content />
        </div>
      ),
    },
    Card: {
      // Add the fields for the title, description and padding
      fields: {
        title: { type: 'text', contentEditable: true },
        subtitle: { type: 'text', contentEditable: true },
        description: { type: 'textarea', contentEditable: true },
        padding: { type: 'number', min: 4, max: 64 },
      },
      // Add default values for each field
      defaultProps: {
        title: 'Card Title',
        subtitle: 'Card Subtitle',
        description: 'Example Description',
        padding: 16,
      },
      render: ({ title, subtitle, description, padding }) => {
        // Render the card using the values from its fields
        return (
          <div
            className="border border-gray-200 rounded-sm shadow-sm"
            style={{ padding }}
          >
            <CardHeader
              // avatar={<Avatar aria-label="recipe">R</Avatar>}
              title={title}
              subheader={subtitle}
            />
            <p>{description}</p>
          </div>
        );
      },
    },
    FlexContainer: {
      render: () => {
        return (
          <DropZone
            zone="flex-zone"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
            }}
          />
        );
      },
    },
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
      components: [
        'Grid',
        'FlexContainer',
        'ColumnsBlock',
        'ToggleBlock',
        'Card',
      ],
    },
    tasking: {
      title: 'Tasking',
      components: ['TaskItemBlock'],
      defaultExpanded: true,
    },
  },
};

export default config;
