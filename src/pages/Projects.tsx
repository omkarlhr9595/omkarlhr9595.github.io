import { Link } from "react-router-dom";
import useBarba from "../hooks/useBarba";

interface ProjectCardProps {
  title: string;
  description: string;
  link?: string;
}

const ProjectCard = ({ title, description, link }: ProjectCardProps) => {
  return (
    <div className="project-card bg-[#222] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-4 flex-grow">{description}</p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FAFAFC] hover:text-gray-300 font-medium font-body"
        >
          View Project →
        </a>
      )}
    </div>
  );
};

interface Project {
  title: string;
  description: string;
  link: string;
}

const Projects = () => {
  useBarba();

  const projects: Project[] = [
    {
      title: "Smash Error",
      description:
        "A full-stack e-commerce application with payment integration",
      link: "https://github.com/omkarlhr9595/SmashError",
    },
    {
      title: "Portfolio Website",
      description: "Personal portfolio built with React and Tailwind CSS",
      link: "#",
    },
  ];

  return (
    <div
      data-barba="container"
      data-barba-namespace="projects"
      className="container mx-auto px-4 py-12 max-w-6xl"
    >
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-bgwhite font-body animate-slide-up">
          My Projects
        </h1>
        <Link
          to="/"
          className="border border-gray-700 hover:border-gray-500 text-white px-6 py-2 rounded-full transition-colors duration-300 font-body opacity-0 animate-[fadeIn_0.7s_ease-out_0.5s_forwards]"
        >
          Back Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={index} {...project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
