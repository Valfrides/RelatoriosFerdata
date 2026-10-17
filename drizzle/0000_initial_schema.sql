CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_key" text NOT NULL,
	"setting_value" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "app_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id_cliente" serial PRIMARY KEY NOT NULL,
	"nome_empresa" text NOT NULL,
	"contato_ac" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "servicos_realizados" (
	"id_servico" serial PRIMARY KEY NOT NULL,
	"id_cliente" integer NOT NULL,
	"id_unidade" integer,
	"data_visita" text NOT NULL,
	"periodo" text NOT NULL,
	"qtde_horas" double precision DEFAULT 0 NOT NULL,
	"descricao_servicos" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "unidades" (
	"id_unidade" serial PRIMARY KEY NOT NULL,
	"id_cliente" integer NOT NULL,
	"nome_unidade" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'admin',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "servicos_realizados" ADD CONSTRAINT "servicos_realizados_id_cliente_clientes_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id_cliente") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicos_realizados" ADD CONSTRAINT "servicos_realizados_id_unidade_unidades_id_unidade_fk" FOREIGN KEY ("id_unidade") REFERENCES "public"."unidades"("id_unidade") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_id_cliente_clientes_id_cliente_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id_cliente") ON DELETE cascade ON UPDATE no action;
