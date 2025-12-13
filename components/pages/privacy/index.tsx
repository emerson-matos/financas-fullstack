import { BackButton } from "@/components/back-button";

const Privacy = () => {
  return (
    <div className="w-full p-6">
      <h1 className="mb-4 text-3xl font-bold">Política de Privacidade</h1>
      <p className="mb-6">
        Sua privacidade é importante para nós. Esta Política de Privacidade
        descreve como o <strong>Finanças App</strong> coleta, utiliza, armazena
        e protege suas informações pessoais.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">1. Coleta de Informações</h2>
      <p className="mb-4">
        Coletamos informações que você nos fornece diretamente ao criar uma
        conta, utilizar nossos serviços ou entrar em contato com o suporte.
        Essas informações podem incluir seu nome, e-mail, dados financeiros e
        outras informações relevantes.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">2. Uso das Informações</h2>
      <p className="mb-4">
        As informações coletadas são utilizadas para fornecer e melhorar nossos
        serviços, personalizar sua experiência e enviar comunicações
        relacionadas ao aplicativo. Nós nos comprometemos a não vender suas
        informações para terceiros.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">
        3. Compartilhamento de Informações
      </h2>
      <p className="mb-4">
        Podemos compartilhar suas informações com parceiros de confiança que nos
        auxiliem na operação do aplicativo, desde que essas partes se
        comprometam a manter os dados em sigilo e utilizá-los apenas para os
        fins especificados.
      </p>
      <h2 className="mb-2 text-2xl font-semibold">4. Segurança</h2>
      <p className="mb-4">
        Adotamos medidas de segurança apropriadas para proteger suas informações
        contra acesso não autorizado, alteração, divulgação ou destruição. No
        entanto, nenhum método de transmissão ou armazenamento eletrônico é 100%
        seguro.
      </p>
      {/* <h2 className="mb-2 text-2xl font-semibold">5. Seus Direitos</h2> */}
      {/* <p className="mb-4"> */}
      {/*   Você tem o direito de acessar, corrigir ou excluir suas informações */}
      {/*   pessoais. Se desejar exercer esses direitos, entre em contato conosco */}
      {/*   através do e-mail:{" "} */}
      {/*   <a */}
      {/*  className="text-blue-500 underline" */}
      {/*  href="mailto:suporte@nomedoapp.com" */}
      {/*   > */}
      {/*  suporte@nomedoapp.com */}
      {/*   </a> */}
      {/*   . */}
      {/* </p> */}
      <h2 className="mb-2 text-2xl font-semibold">5. Alterações na Política</h2>
      <p className="mb-4">
        Podemos atualizar esta Política de Privacidade periodicamente. As
        alterações serão publicadas nesta página e entrarão em vigor
        imediatamente após sua publicação.
      </p>
      {/* <h2 className="mb-2 text-2xl font-semibold">7. Contato</h2> */}
      {/* <p className="mb-4"> */}
      {/*   Se você tiver dúvidas ou preocupações sobre nossa Política de */}
      {/*   Privacidade, entre em contato conosco pelo e-mail:{" "} */}
      {/*   <a */}
      {/*  className="text-blue-500 underline" */}
      {/*  href="mailto:suporte@nomedoapp.com" */}
      {/*   > */}
      {/*  suporte@nomedoapp.com */}
      {/*   </a> */}
      {/*   . */}
      {/* </p> */}
      <div className="mb-4 flex items-center">
        <em className="flex-1">
          Data da última atualização: <strong>13 de Março de 2025</strong>
        </em>
        <BackButton />
      </div>
    </div>
  );
};
export { Privacy };
