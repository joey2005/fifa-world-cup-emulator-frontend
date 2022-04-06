import './AboutPage.scss';

function AboutPage() {
  return (
    <section className="about">
      <h1 className="about__title">
        Our Story
      </h1>
      <div className="about__story">
        <p className="about__story-text">
          The World Cup is the most prestigious association football tournament in the world, as well as the most widely viewed and followed single sporting event in the world. The cumulative viewership of all matches of the 2006 World Cup was estimated to be 26.29 billion with an estimated 715.1 million people watching the final match, a ninth of the entire population of the planet.
        </p>
      </div>
      <div className="about__story">
        <p className="about__story-text about__story-text--align-right">
          Inspired by the biggest sporting event of the world, this web app is aiming to provide a simple glance of the football game, and all qualified teams for the upcoming Qatar FIFA Wolrd Cup.
        </p>
      </div>
    </section>
  );
}

export default AboutPage;
