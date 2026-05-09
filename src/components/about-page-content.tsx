"use client";
import * as React from "react";
import Link from "next/link";
import { Arrow as AA, ArrowUpRight as AURA, SvcIcon as SIcoA } from "./site-ui";

// About page sections

const ABOUT_IMAGES = {
  hero: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80&auto=format&fit=crop",
  story1:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80&auto=format&fit=crop",
  story2:
    "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?w=900&q=80&auto=format&fit=crop",
  story3:
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80&auto=format&fit=crop",
  leader:
    "https://s3.ap-south-1.amazonaws.com/emr.buckett/WhatsApp%20Image%202025-10-18%20at%209.50.02%20AM.jpeg",
  c1: "https://images.unsplash.com/photo-1565008576549-57569a49371c?w=900&q=80&auto=format&fit=crop",
  c2: "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=900&q=80&auto=format&fit=crop",
  c3: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&q=80&auto=format&fit=crop",
  t1: "https://res.cloudinary.com/dk4csiouq/image/upload/v1776938526/MdZakir_novdeb.jpg",
  t2: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80&auto=format&fit=crop",
  t3: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80&auto=format&fit=crop",
  t4: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop",
  t5: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&auto=format&fit=crop",
};

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="square"
    >
      <polyline points="4,12 10,18 20,6" />
    </svg>
  );
}

export function AboutPageContent() {
  const expertise = [
    {
      icon: "building",
      n: "01",
      t: "Building Construction (Residential & Commercial)",
      d: "Commercial, residential & institutional builds.",
    },
    {
      icon: "road",
      n: "02",
      t: "Road Construction & Infrastructure Development",
      d: "Highways, urban roads & site roadworks.",
    },
    {
      icon: "bridge",
      n: "03",
      t: "Bridge and Culvert Construction",
      d: "RCC bridge & culvert engineering and delivery.",
    },
    {
      icon: "earth",
      n: "04",
      t: "Earthwork & Land Development",
      d: "Excavation, grading and site preparation.",
    },
    {
      icon: "drain",
      n: "05",
      t: "Drainage System Construction",
      d: "Stormwater, sewerage and rainwater systems.",
    },
    {
      icon: "concrete",
      n: "06",
      t: "Structural Concrete Works",
      d: "RCC frame, slab & shear-wall construction.",
    },
    {
      icon: "foundation",
      n: "07",
      t: "Foundation Engineering Works",
      d: "Bored piling, pad and raft foundations.",
    },
    {
      icon: "renov",
      n: "08",
      t: "Renovation & Maintenance Services",
      d: "Retrofits, repairs and long-term maintenance.",
    },
    {
      icon: "finish",
      n: "09",
      t: "Finishing & Interior Works",
      d: "Premium finishing, interiors and exteriors.",
    },
    {
      icon: "special",
      n: "10",
      t: "Specialized Construction Solutions",
      d: "Complex custom engineering scopes.",
    },
    {
      icon: "equip",
      n: "11",
      t: "Construction Equipment & Machinery Support",
      d: "Plant, crane and equipment systems.",
    },
  ];

  const timeline = [
    {
      year: "2010",
      title: "Company Founded",
      p: "Established strong expertise in construction management and project execution",
    },
    {
      year: "2012",
      title: "First Major Project",
      p: "Successfully delivered diverse public and private sector projects",
    },
    {
      year: "2015",
      title: "Road & Civil Expansion",
      p: "Expanded capabilities across infrastructure, industrial, and building construction",
    },
    {
      year: "2018",
      title: "Regional Growth",
      p: "Adopted modern engineering techniques and construction technologies",
      active: true,
    },
    {
      year: "2023",
      title: "Large-Scale Projects",
      p: "Earned trust through consistent quality and timely project delivery",
    },
    {
      year: "Next",
      title: "Future Vision",
      p: "Strengthened focus on safety, sustainability, and long-term client relationships",
    },
  ];

  const team = [
    {
      name: "Abu Zakir",
      role: "Managing Director",
      bio: "25+ years in civil works and commercial construction.",
      img: ABOUT_IMAGES.t1,
    },
    // {
    //   name: "Eng. Arif Rahman",
    //   role: "Chief Engineer",
    //   bio: "Structural engineering lead across all major builds.",
    //   img: ABOUT_IMAGES.t2,
    // },
    // {
    //   name: "Tanvir Ahmed",
    //   role: "Head of Operations",
    //   bio: "Procurement, scheduling and multi-site delivery.",
    //   img: ABOUT_IMAGES.t3,
    // },
    // {
    //   name: "Nazmul Hasan",
    //   role: "Finance Director",
    //   bio: "Budgeting, cost control and financial governance.",
    //   img: ABOUT_IMAGES.t4,
    // },
    // {
    //   name: "Eng. Salma Khatun",
    //   role: "Project Director",
    //   bio: "On-site project leadership and client liaison.",
    //   img: ABOUT_IMAGES.t5,
    // },
  ];

  const why = [
    {
      ico: "?",
      t: "Systematic and process-driven project execution",
      d: "100+ completed projects with documented QA sign-off.",
    },
    {
      ico: "?",
      t: "Strong technical expertise backed by experienced engineering teams",
      d: "Experienced engineers, surveyors and site supervisors.",
    },
    {
      ico: "?",
      t: "Consistent quality control and adherence to construction standards",
      d: "Operating across every district of Bangladesh.",
    },
    {
      ico: "?",
      t: "Strict safety practices across all project sites",
      d: "BIM-driven planning and weekly client reviews.",
    },
    {
      ico: "?",
      t: "Transparent coordination with clients and stakeholders",
      d: "Certified safety protocols on every site.",
    },
    {
      ico: "?",
      t: "Commitment to durable, sustainable, and long-lasting construction",
      d: "Track record of on-time and ahead-of-schedule delivery.",
    },
    {
      ico: "?",
      t: "Transparent Communication",
      d: "Clear reporting, budgets and change-order processes.",
    },
    {
      ico: "?",
      t: "Quality Assurance",
      d: "Three-stage QA, materials testing and handover audits.",
    },
  ];

  const achievements = [
    {
      n: "100",
      unit: "+",
      lbl: "Successfully Completed Diverse Construction Projects",
    },
    { n: "15", unit: "+", lbl: "Years Experience" },
    { n: "250", unit: "+", lbl: "Workforce" },
    { n: "64", unit: "", lbl: "Engagements" },
    { n: "98", unit: "%", lbl: "Client Confidence" },
  ];

  const culture = [
    {
      t: "Strong project accountability and responsibility",
      d: "Trained engineers and field teams with continuous development.",
    },
    {
      t: "Quality-focused execution at every stage",
      d: "Zero-compromise PPE, toolbox talks and incident reviews.",
    },
    {
      t: "Strict adherence to safety standards",
      d: "Tolerances and QA protocols checked at every stage.",
    },
    {
      t: "Effective teamwork and coordination",
      d: "Clear ownership from project manager to site foreman.",
    },
  ];

  const clients = [
    { n: "MINISTRY OF PWD", s: "Government" },
    { n: "LGED", s: "Government" },
    { n: "RHD", s: "Infrastructure" },
    { n: "RAJUK", s: "Government" },
    { n: "BRIDGE AUTHORITY", s: "Infrastructure" },
    { n: "WASA", s: "Infrastructure" },
    { n: "BADC", s: "Government" },
    { n: "BWDB", s: "Infrastructure" },
    { n: "CITY CORPORATION", s: "Government" },
    { n: "HOUSING & PW", s: "Residential" },
    { n: "ASSURE GROUP", s: "Commercial" },
    { n: "NAVANA REAL ESTATE", s: "Residential" },
    { n: "BAY DEVELOPMENTS", s: "Commercial" },
    { n: "BTI", s: "Residential" },
    { n: "CONCORD GROUP", s: "Commercial" },
    { n: "RUET", s: "Government" },
  ];
  const sectors = [
    "All",
    "Government",
    "Residential",
    "Commercial",
    "Infrastructure",
  ];
  const [sector, setSector] = React.useState("All");
  const filteredClients =
    sector === "All" ? clients : clients.filter((c) => c.s === sector);

  return (
    <>
      {/* 1. Inner hero */}
      <section className="about-hero" data-screen-label="01 About Hero">
        <div className="container">
          <div className="about-hero-grid">
            <div>
              <span className="microlabel">ZAKIR ENTERPRISE</span>
              <h1>Building Excellence Through Quality, Innovation & Trust</h1>
              <p className="sub">
                Zakir Enterprise is a leading construction and engineering
                company in Bangladesh with over 16 years of experience. We
                specialize in delivering high-quality infrastructure,
                commercial, and residential projects through expert planning,
                advanced technology, and a strong commitment to safety,
                sustainability, and client satisfaction.
              </p>
              <div className="about-hero-buttons">
                <Link href="/projects" className="btn btn-primary">
                  Explore Our Projects <AA />
                </Link>
                <Link href="/lets-collaborate" className="btn btn-outline-dark">
                  Get in Touch <AURA />
                </Link>
              </div>
            </div>
            <div className="about-hero-visual">
              <div
                className="main"
                style={{ backgroundImage: `url(${ABOUT_IMAGES.hero})` }}
              />
              <div className="tag">
                Modern commercial building visual with 15+ years highlight.
              </div>
              <div className="stamp">
                <div className="big">15+</div>
                <div className="lbl">Years of Engineering</div>
              </div>
            </div>
          </div>
          <div className="crumb-about">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <span style={{ color: "var(--black)" }}>About Us</span>
          </div>
        </div>
      </section>

      {/* 2. Story */}
      <section className="story-section" data-screen-label="02 Story">
        <div className="container">
          <div className="story-grid">
            <div className="story-collage">
              <div className="badge">Since 2010</div>
              <div
                className="cell tall"
                style={{ backgroundImage: `url(${ABOUT_IMAGES.story1})` }}
              />
              <div
                className="cell"
                style={{ backgroundImage: `url(${ABOUT_IMAGES.story2})` }}
              />
              <div
                className="cell"
                style={{ backgroundImage: `url(${ABOUT_IMAGES.story3})` }}
              />
            </div>
            <div className="story-copy">
              <span className="microlabel">Our Story</span>
              <h2>Building Visions Into Reality</h2>
              <p>
                Zakir Enterprise was established with a vision to deliver
                reliable and high-quality construction solutions across
                Bangladesh. Over the past 16+ years, the company has developed
                strong expertise in construction management, engineering design,
                and project execution, becoming a trusted partner for both
                public and private sector projects. Our capabilities span a wide
                range of construction disciplines including high-rise buildings,
                roads and bridges, industrial facilities, land development,
                drainage systems, and specialized engineering works. We also
                provide complete engineering services such as architectural
                design, structural engineering, MEP systems, and project
                planning. At Zakir Enterprise, every project is driven by a
                commitment to quality, safety, and sustainability. We combine
                skilled manpower, modern machinery, and systematic project
                management to ensure timely delivery and long-lasting results.
                Our goal is not just to build structures, but to create durable
                and efficient solutions that contribute to national development.
              </p>
              <p></p>
              <div className="story-stats">
                <div className="item">
                  <div className="n">
                    15<span className="plus">+</span>
                  </div>
                  <div className="lbl">Years of Experience</div>
                </div>
                <div className="item">
                  <div className="n">
                    50<span className="plus">+</span>
                  </div>
                  <div className="lbl">Projects</div>
                </div>
                <div className="item">
                  <div className="n">
                    250<span className="plus">+</span>
                  </div>
                  <div className="lbl">Team</div>
                </div>
                <div className="item">
                  <div className="n">
                    64<span className="plus">+</span>
                  </div>
                  <div className="lbl">Projects</div>
                </div>
              </div>
              <Link href="/projects" className="btn btn-dark">
                Discover Our Work <AA />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Expertise snapshot */}
      <section className="about-expertise" data-screen-label="03 Expertise">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">OUR CAPABILITIES</span>
              <h2>Eleven disciplines. One contractor.</h2>
            </div>
            <p className="head-right">
              Our expertise covers a comprehensive range of construction and
              engineering services across Bangladesh.
            </p>
          </div>
          <div className="ae-grid">
            {expertise.map((e) => (
              <div key={e.n} className="ae-item">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span className="ae-num">{e.n}</span>
                  <div className="ae-ico">
                    <SIcoA kind={e.icon} />
                  </div>
                </div>
                <h4>{e.t}</h4>
                <p>{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Mission, Vision, Values */}
      <section className="mvv-section" data-screen-label="04 MVV">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">FOUNDATIONS / 04</span>
              <h2>Our Mission, Vision & Values</h2>
            </div>
            <p className="head-right">
              The principles that guide every estimate we submit, every site we
              mobilise, and every handover we sign off.
            </p>
          </div>
          <div className="mvv-grid">
            <div className="mvv-card">
              <div className="mvv-ico">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              {/* <span className="mvv-label">01 - Mission</span> */}
              <h3>Mission</h3>
              <p>
                To deliver high-quality construction and engineering services by
                transforming client visions into reality while maintaining the
                highest standards of safety, sustainability, and excellence.
              </p>
            </div>
            <div className="mvv-card highlight">
              <div className="mvv-ico">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 12 L12 3 L21 12" />
                  <path d="M5 10 V21 H19 V10" />
                </svg>
              </div>
              {/* <span className="mvv-label">02 - Vision</span> */}
              <h3>Vision</h3>
              <p>
                To be a leading construction company in Bangladesh, recognized
                for innovation, technical expertise, and a strong commitment to
                quality, sustainability, and client satisfaction.
              </p>
            </div>
            <div className="mvv-card">
              <div className="mvv-ico">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polygon points="12,3 21,8 21,16 12,21 3,16 3,8" />
                </svg>
              </div>
              {/* <span className="mvv-label">03 - Values</span> */}
              <h3>Core Values</h3>
              <ul className="mvv-values">
                <li>Quality</li>
                <li>Integrity</li>
                <li>Innovation</li>
                <li>Safety</li>
                <li>Sustainability</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Timeline / Process */}
      <section className="cd-process" data-screen-label="05 Timeline">
        <div className="container">
          <div className="cd-section-head">
            <div>
              <span className="microlabel on-dark">Work Process</span>
              <h2>Our Journey of Growth</h2>
            </div>
            <p>
              Over more than 16 years, Zakir Enterprise has built a strong
              foundation through experience, technical expertise, and successful
              project execution across Bangladesh.
            </p>
          </div>
          <div className="cd-process-track">
            {timeline.map((t, i) => (
              <div
                key={i}
                className={"cd-process-step " + (t.active ? "active" : "")}
              >
                <div className="cd-process-connector">
                  <span className="cd-process-dot" />
                  {i < timeline.length - 1 && (
                    <span className="cd-process-line" />
                  )}
                </div>
                <div className="cd-process-body">
                  <div className="cd-process-num">{t.year}</div>
                  <h4>{t.title}</h4>
                  <p>{t.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Leadership message */}
      <section className="leader-msg" data-screen-label="06 Leadership Msg">
        <div className="container">
          <div className="leader-msg-grid">
            <div
              className="leader-portrait"
              style={{ backgroundImage: `url(${ABOUT_IMAGES.leader})` }}
            >
              <div className="signature">
                <div className="name">Abu Zakir</div>
                <div className="role">Managing Director</div>
              </div>
            </div>
            <div className="leader-copy">
              <span className="microlabel">MESSAGE FROM MANAGEMENT</span>
              <h2>Commitment to Excellence</h2>
              <div className="leader-quote">
                <p>
                  "We are dedicated to delivering construction solutions that
                  reflect quality, integrity, and long-term value for our
                  clients and communities."
                </p>
              </div>
              <p className="body">
                At Zakir Enterprise, we believe construction is more than
                building structures - it is about creating lasting value through
                expertise, innovation, and responsible execution. With years of
                industry experience, our leadership ensures that every project
                is delivered with professionalism, precision, and
                accountability.
              </p>
              <p className="body">
                We emphasize strong coordination between engineering, planning,
                and execution teams to maintain quality standards, meet
                timelines, and exceed client expectations. Our commitment
                extends beyond project completion, focusing on durability,
                sustainability, and long-term performance.
              </p>
              <div className="leader-signoff">
                <div>
                  <div className="name">Abu Zakir</div>
                  <div className="role">Founder &amp; Managing Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Leadership team */}
      <section className="team-section" data-screen-label="07 Team">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">OUR MANAGEMENT TEAM</span>
              <h2>Experienced & Dedicated Leadership</h2>
            </div>
            <p className="head-right">
              Our management team consists of experienced professionals with
              expertise in engineering, project management, construction
              execution, and administrative operations, ensuring efficient
              delivery of every project.
            </p>
          </div>
          <div className="team-grid">
            {team.map((p) => (
              <div key={p.name} className="team-card xl:min-w-[300px]">
                <div
                  className="team-photo "
                  style={{ backgroundImage: `url(${p.img})` }}
                />
                <div className="team-body">
                  <div className="role">{p.role}</div>
                  <div className="name">{p.name}</div>
                  <div className="bio">{p.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Why choose us */}
      <section className="why-section" data-screen-label="08 Why">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="num">WHY CHOOSE US</span>
              <h2>Why clients trust Zakir Enterprise.</h2>
            </div>
            <p className="head-right">
              Eight operational commitments that show up on every contract -
              whether it's a Tk 2cr culvert or a Tk 200cr commercial tower.
            </p>
          </div>
          <div className="why-grid">
            {why.map((w) => (
              <div key={w.t} className="why-item">
                <div className="why-ico">
                  <CheckIcon />
                </div>
                <h4>{w.t}</h4>
                <p>{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Achievements */}
      <section className="ach-section" data-screen-label="09 Achievements">
        <div className="container">
          <div className="ach-head">
            <span className="microlabel on-dark">By the Numbers</span>
            <h2>Over 16 years of proven construction excellence</h2>
          </div>
          <div className="ach-grid">
            {achievements.map((a) => (
              <div key={a.lbl} className="ach-cell">
                <div className="n">
                  {a.n}
                  <span className="unit">{a.unit}</span>
                </div>
                <div className="lbl">{a.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Culture */}
      <section className="culture-section" data-screen-label="10 Culture">
        <div className="container">
          <div className="culture-grid">
            <div className="culture-copy">
              <span className="microlabel">OUR TEAM</span>
              <h2>Driven by Expertise and Commitment</h2>
              <p>
                Our strength lies in a dedicated team of engineers, project
                managers, technical specialists, and skilled workers who bring
                professionalism, discipline, and experience to every project.
                Through strong coordination and a shared commitment to quality,
                we ensure efficient execution from planning to completion.
              </p>
              <ul className="culture-bullets">
                {culture.map((c) => (
                  <li key={c.t}>
                    <span className="chk">
                      <CheckIcon />
                    </span>
                    <div>
                      <div>{c.t}</div>
                      <span className="desc">{c.d}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="culture-collage">
              <div
                className="cell wide"
                style={{ backgroundImage: `url(${ABOUT_IMAGES.c1})` }}
              />
              <div
                className="cell"
                style={{ backgroundImage: `url(${ABOUT_IMAGES.c2})` }}
              />
              <div
                className="cell"
                style={{ backgroundImage: `url(${ABOUT_IMAGES.c3})` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 11. Trust / clients */}
      <section className="trust-section" data-screen-label="11 Clients">
        <div className="container">
          <div className="trust-head">
            <span className="microlabel" style={{ justifyContent: "center" }}>
              OUR PROJECT PARTNERS
            </span>
            <h2>Trusted Across Major Projects in Bangladesh</h2>
            <div className="trust-sectors">
              {sectors.map((s) => (
                <button
                  key={s}
                  className={"ts-chip " + (sector === s ? "active" : "")}
                  onClick={() => setSector(s)}
                >
                  {s}
                  <span className="ts-count">
                    {s === "All"
                      ? clients.length
                      : clients.filter((c) => c.s === s).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="trust-logos">
            {filteredClients.map((c) => (
              <div key={c.n} className="trust-logo">
                <span>{c.n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final CTA - reuses trust-cta */}
      <section className="trust-cta" data-screen-label="12 CTA">
        <div className="container">
          <div className="trust-cta-inner">
            <div>
              <span className="microlabel on-dark">Start the Conversation</span>
              <h2 style={{ marginTop: 20 }}>
                Ready to <span className="gold">build</span> with{" "}
                <span className="accent">confidence?</span>
              </h2>
            </div>
            <div>
              <p>
                Partner with Zakir Enterprise for reliable construction and
                engineering excellence from initial consultation through
                handover and long-term maintenance.
              </p>
              <div className="trust-cta-buttons">
                <Link href="/lets-collaborate" className="btn btn-primary">
                  Request Consultation <AA />
                </Link>
                <Link href="/projects" className="btn btn-outline-light">
                  View Portfolio <AURA />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
