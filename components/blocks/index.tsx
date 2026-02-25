import { tinaField } from 'tinacms/dist/react';
import { Page, PageBlocks } from '../../tina/__generated__/types';
import { CallToAction } from './call-to-action';
import { Callout } from './callout';
import { Content } from './content';
import { Features } from './features';
import { Hero } from './hero';
import { Journey } from './journey';
import { LatestPostsList } from './latest-posts-list';
import { Mermaid } from './mermaid';
import { RecentPosts } from './recent-posts';
import { Stats } from './stats';
import { Testimonial } from './testimonial';
import { Video } from './video';

export const Blocks = (props: any) => {
  if (!props.blocks) return null;
  return (
    <>
      {props.blocks.map(function (block: any, blockIdx: number) {
        return (
          <div key={`${block?.__typename}-${blockIdx}`} data-tina-field={tinaField(block)}>
            <Block {...block} />
          </div>
        );
      })}
    </>
  );
};

const Block = (block: PageBlocks) => {
  switch (block.__typename) {
    case 'PageBlocksVideo':
      return <Video data={block} />;
    case 'PageBlocksMermaid':
      return <Mermaid {...(block as any)} />;
    case 'PageBlocksHero':
      return <Hero data={block} />;
    case 'PageBlocksCallout':
      return <Callout data={block} />;
    case 'PageBlocksStats':
      return <Stats data={block} />;
    case 'PageBlocksContent':
      return <Content data={block} />;
    case 'PageBlocksFeatures':
      return <Features data={block} />;
    case 'PageBlocksTestimonial':
      return <Testimonial data={block} />;
    case 'PageBlocksCta':
      return <CallToAction data={block} />;
    case 'PageBlocksRecent':
      return <RecentPosts data={block} />;
    case 'PageBlocksLatestPostsList':
      return <LatestPostsList data={block as any} />;
    case 'PageBlocksJourney':
      return <Journey data={block} />;
    default:
      return null;
  }
};
