import React from 'react';

const AboutUs = () => {
  return (
    <div>
      <div className='baner'
        style={{
          width: '100%',
          maxWidth: '1955px',
          minHeight: '487px',
          backgroundImage: "url('/images/aboutus.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: '0 auto',
          marginTop: '-110px',
          zIndex: 1
        }}>
      </div>

      {/* Outline-текст ЗВЕРХУ */}
        <div
          style={{
            width: "100%",
            maxWidth: 1150,
            textAlign: "center",
            marginBottom: 18,
            marginTop: '-320px',
            marginBlockEnd: '300px',
          }}
        >
          <span
            style={{
              fontFamily: "'Sora', Arial, sans-serif",
              fontWeight: 700,
              fontSize: 130,
              lineHeight: 1.1,
              color: "transparent",
              WebkitTextStroke: "1.5px #fff",
              textStroke: "1.5px #fff",
              letterSpacing: "0px",
              display: "inline-block",
            }}
          >
            ABOUT US
          </span>
        </div>

      <div className="container my-5">
        <div className="row bg-white rounded-4 px-2  mx-0 align-items-center flex-md-row flex-column"
          style={{ maxWidth: '1300px', margin: '80px auto 0 auto' }}>
        
          <div className="col-md-7 col-12 mb-4 mb-md-0">
            <h2 className="fw-normal mb-2" style={{ fontSize: '2.2rem' }}>
              Welcome to <b>BOOKIT</b>
            </h2>
            <p className="mb-3" style={{ fontSize: '1.25rem', color: '#3e3e3e' }}>
              Your trusted partner in creating the perfect getaway!
            </p>
            <p className="mb-4" style={{ color: '#666', fontSize: '1.07rem' }}>
              At <b>BookIt</b>, we're passionate about helping you plan unforgettable vacations. Since our founding in 2016, we’ve been committed to making travel simple, affordable, and stress-free. Whether you’re dreaming of a beach escape, a city adventure, or a relaxing retreat, we connect you with the best travel deals and experiences around the globe.
            </p>

            <div className="row gap-3 gap-md-0 mt-3" style={{ maxWidth: 600 }}>
              <div className="col-6 col-md-3 d-flex flex-column align-items-center mb-3 mb-md-0">
                <span className="fw-bold" style={{ color: '#2ca377', fontSize: '1.5rem' }}>95%</span>
                <div style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>Customer Satisfaction</div>
              </div>
              <div className="col-6 col-md-3 d-flex flex-column align-items-center mb-3 mb-md-0">
                <span className="fw-bold" style={{ color: '#2ca377', fontSize: '1.5rem' }}>75+</span>
                <div style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>Popular Destination</div>
              </div>
              <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                <span className="fw-bold" style={{ color: '#2ca377', fontSize: '1.5rem' }}>150+</span>
                <div style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>Experienced Guide</div>
              </div>
              <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                <span className="fw-bold" style={{ color: '#2ca377', fontSize: '1.5rem' }}>22K</span>
                <div style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>Happy Clients</div>
              </div>
            </div>
          </div>
         
          <div className="col-md-5 col-12 d-flex justify-content-center align-items-center">
            <img
              src="/images/aboutusbag.png"
              alt="Дівчина на чемодані"
              className="img-fluid rounded-3"
              style={{ maxWidth: 340, minWidth: 180 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
