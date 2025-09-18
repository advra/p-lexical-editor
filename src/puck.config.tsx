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
import ChecklistBlock, {
  ChecklistBlockProps,
} from './components/puck/ChecklistBlock';
// import rootPage from './components/puck/RootPage';

type Props = {
  ChecklistBlock: ChecklistBlockProps;
  ToggleBlock: ToggleBlockProps;
  HeadingBlock: HeadingBlockProps;
  SectionBlock: SectionBlockProps;
  ColumnsBlock: ColumnsBlockProps;
  TextBlock: TextBlockProps;
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
      description: { label: 'Description: (Not Displayed)', type: 'textarea' },
      projectTag: { type: 'text' },
      padding: {
        type: 'select',
        label: 'Padding',
        options: [
          { label: '0', value: 'p-0' },
          { label: '4', value: 'p-4' },
          { label: '6', value: 'p-6' },
          { label: '8', value: 'p-8' },
          { label: '10', value: 'p-10' },
          { label: '12', value: 'p-12' },
          { label: '16', value: 'p-16' },
          { label: '18', value: 'p-18' },
          { label: '20', value: 'p-20' },
        ],
      },
    },
    defaultProps: {
      padding: 12,
    },
    render: ({ children, title, description, projectTag, padding }) => {
      return (
        <>
          <div className="pl-5 pt-2 text-gray-500">
            Project Tag: {projectTag || 'N/A'}
          </div>
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
    Grid: {
      render: () => {
        // Render a Grid DropZone where users are able to drag and drop components
        return (
          <DropZone
            zone="my-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '16px',
            }}
          />
        );
      },
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
            className="m-2 px-2 border border-gray-200 rounded-sm shadow-sm"
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
      components: ['HeadingBlock', 'TextBlock'],
      defaultExpanded: true,
    },
    formatting: {
      defaultExpanded: true,
      title: 'Formatting',
      components: ['Grid', 'ColumnsBlock', 'ToggleBlock', 'Card'],
    },
  },
};

export default config;
