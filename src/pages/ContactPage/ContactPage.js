import linkedinContact from '../../assets/images/qr-code-linkedin.jpg';
import githubContact from '../../assets/images/qr-code-github.jpg';
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
            Email
          </h3>
          <div className="contact__detail">
            <p>yanliuse7@gmail.com</p>
          </div>
        </div>
        <div className="contact__box">
          <h3 className="contact__method">
            LinkedIn
          </h3>
          <img 
            src={linkedinContact}
            alt="linkedin-contact"
            className="contact__qr-code"
          />
        </div>
        <div className="contact__box">
          <h3 className="contact__method">
            GitHub
          </h3>
          <img 
            src={githubContact}
            alt="github-contact"
            className="contact__qr-code"
          />
        </div>
      </div>
    </section>
  );
}

export default ContactPage;
