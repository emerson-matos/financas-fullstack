import BackButton from "@/components/back-button";

const Terms = () => {
  return (
    <div className="w-full p-6">
      <h1 className="mb-4 text-3xl font-bold">Termos e Condições</h1>
      <p className="mb-6">
        Bem-vindo ao <strong>Finanças App</strong>! Estes Termos e Condições
        regem o uso do nosso aplicativo de gerenciamento de finanças pessoais.
        Ao acessar e utilizar o aplicativo, você concorda com os termos aqui
        estabelecidos.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">1. Uso do Aplicativo</h2>
      <p className="mb-4">
        Você concorda em usar o aplicativo de forma responsável e de acordo com
        todas as leis e regulamentos aplicáveis. É proibido utilizar o
        aplicativo para fins ilegais ou não autorizados.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">2. Cadastro e Segurança</h2>
      <p className="mb-4">
        Para acessar determinados recursos, pode ser necessário criar uma conta.
        Você é responsável por manter a confidencialidade das suas informações
        de login e por todas as atividades realizadas com sua conta.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">3. Privacidade</h2>
      <p className="mb-4">
        Respeitamos a sua privacidade. Consulte nossa{" "}
        <a href="/privacidade">Política de Privacidade</a> para obter mais
        informações sobre como coletamos, usamos e protegemos suas informações
        pessoais.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">
        4. Limitação de Responsabilidade
      </h2>
      <p className="mb-4">
        O <strong>Finanças App</strong> não se responsabiliza por quaisquer
        danos diretos, indiretos, incidentais ou consequentes decorrentes do uso
        ou da incapacidade de usar o aplicativo.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">5. Alterações aos Termos</h2>
      <p className="mb-4">
        Podemos atualizar estes Termos e Condições periodicamente. As alterações
        serão publicadas nesta página e entrarão em vigor imediatamente após sua
        publicação.
      </p>
      {/* <h2 className="text-2xl font-semibold mb-2">6. Contato</h2> */}
      {/* <p className="mb-4"> */}
      {/*   Se você tiver qualquer dúvida sobre estes Termos e Condições, entre em */}
      {/*   contato conosco através do e-mail: */}
      {/*   <a href="mailto:suporte@nomedoapp.com"> suporte@nomedoapp.com</a>. */}
      {/* </p> */}
      <div className="mb-4 flex items-center">
        <em className="flex-1">
          Data da última atualização: <strong>12 de Março de 2025</strong>
        </em>
        <BackButton />
      </div>
    </div>
  );
};
export { Terms };
