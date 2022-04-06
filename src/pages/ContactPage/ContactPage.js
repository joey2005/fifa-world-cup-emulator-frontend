import './ContactPage.scss';

function ContactPage() {
  return (
    <section className="contact">
      <h1 className="contact__title">
        Contact Us
      </h1>
      <p className="contact__main">
        Have a question about? Interested in providing new ideas? Don't hesistate to reach out to us.
      </p>
      <div className="contact__information">
        <div className="contact__box">
          <h3 className="contact__method">
            Address
          </h3>
          <p className="contact__detail">
            57 Queen St N, Kitchenr ON N2H 6T7
          </p>
        </div>
        <div className="contact__box">
          <h3 className="contact__method">
            Email Us
          </h3>
          <p className="contact__detail">
            yanliuse7@gmail.com
          </p>
        </div>
        <div className="contact__box">
          <h3 className="contact__method">
            Call Us
          </h3>
          <p className="contact__detail">
            +1-(226)-899-6283
          </p>
        </div>
        <div className="contact__box">
          <h3 className="contact__method">
            Hours
          </h3>
          <p className="contact__detail">
            <span className="contact__detail--bold">Monday - Friday:</span> 9 AM - 5 PM EST
          </p>
          <p className="contact__detail">
            <span className="contact__detail--bold">Saturday - Sunday:</span> 10 AM - 3:30 PM EST
          </p>
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
