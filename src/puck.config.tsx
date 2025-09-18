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
// import rootPage from './components/puck/RootPage';

type Props = {
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
